import { ObjectID } from "bson";

import { MongoDoc } from "@/model/models";
import { ValOrErr, withErr } from "@/util/errors";

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

export class SearchClient {
  public static async create(searchStreamerURL: string) {
    const ws = await RequestWebSocket.open(searchStreamerURL);
    return new SearchClient(ws);
  }

  private ws: RequestWebSocket;

  private constructor(ws: RequestWebSocket) {
    this.ws = ws;
  }

  public async queryByString<T = any>(q: string): Promise<ValOrErr<SearchResults<T>>> {
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

  public async query<T = any>(searchBody: any, index = "_all"): Promise<ValOrErr<SearchResults<T>>> {
    const [resp, err] = await withErr(this.ws.doSimpleRequest<SearchResults<T>>({ searchBody, index }));
    if (err) {
      return [null, err];
    }

    return [resp, null];
  }

  public async suggest(field: string, index: string, prefix: string): Promise<ValOrErr<string[]>> {
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

    const [resp, err] = await withErr(this.ws.doSimpleRequest<CompletionResult>(reqBody));
    if (err) {
      return [null, err];
    }

    return [resp.suggest.current.options.map(o => o.text), null];
  }
}

export function modelFromSearchHit<T extends MongoDoc>(h: SearchHit<T>) {
  h._source._id = new ObjectID(h._id);
  return h._source;
}
