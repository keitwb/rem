import { ValOrErr, withErr } from "@/util/errors";
import RequestWebSocket from "./websocket/request";

export interface SearchHit<T = any> {
  readonly _index: string;
  readonly _id: string;
  readonly _score: number;
  readonly _source: T;
  readonly highlight: Highlight;
}

export interface Highlight {
  readonly [index: string]: string[];
}

export interface Hits {
  readonly hits: SearchHit[];
  readonly max_score: number;
  readonly total: number;
}

export interface SearchResults {
  readonly hits: Hits;
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

  public async query(q: string): Promise<ValOrErr<SearchResults>> {
    const body = {
      highlight: {
        fields: { "*": {} },
        type: "fvh",
      },
      query: {
        query_string: {
          query: q,
        },
      },
    };

    const [resp, err] = await withErr(this.ws.doSimpleRequest<SearchResults>({ searchBody: body }));
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
