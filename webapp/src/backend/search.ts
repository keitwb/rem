import { ObjectID } from "bson";

import { MongoDoc } from "@/model/models.gen";

import RequestWebSocket from "./websocket/request";

export interface SearchHit<T> {
  readonly _index: string;
  readonly _id: string;
  readonly _score: number;
  readonly _source: T;
  readonly highlight: Highlight;
}

export interface Highlight {
  readonly [index: string]: string[];
}

export interface Hits<T> {
  readonly hits: Array<SearchHit<T>>;
  readonly max_score: number;
  readonly total: number;
}

export interface SearchResults<T> {
  readonly hits: Hits<T>;
}

export interface CompletionResult {
  readonly suggest: {
    [index: string]: {
      options: Array<{
        text: string;
        _id: string;
      }>;
    };
  };
}

interface GetFieldsResult {
  fields: string[];
}

export class SearchClient {
  private ws: RequestWebSocket;

  constructor(searchStreamerURL: string) {
    this.ws = new RequestWebSocket(searchStreamerURL);
  }

  public async queryByString<T = any>(q: string): Promise<SearchResults<T>> {
    return this.query({
      highlight: {
        fields: { "*": {} },
        type: "fvh",
      },
      query: {
        query_string: {
          query: q,
        },
      },
    });
  }

  public async query<T = any>(body: any, index = "_all"): Promise<SearchResults<T>> {
    return await this.ws.doSimpleRequest<SearchResults<T>>({ action: "search", body, index });
  }

  public async getFields(index = "_all"): Promise<GetFieldsResult> {
    return await this.ws.doSimpleRequest<GetFieldsResult>({ action: "getFields", index });
  }

  public async suggest(field: string, index: string, prefix: string): Promise<string[]> {
    const reqBody = {
      index,
      suggest: {
        current: {
          completion: {
            field: `${field}.completion`,
          },
          prefix,
        },
      },
    };

    const resp = await this.ws.doSimpleRequest<CompletionResult>(reqBody);
    return resp.suggest.current.options.map(o => o.text);
  }
}

export function modelFromSearchHit<T extends MongoDoc>(h: SearchHit<T>) {
  h._source._id = new ObjectID(h._id);
  return h._source;
}
