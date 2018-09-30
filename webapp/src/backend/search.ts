import { ValOrErr, withErr } from "@/util/errors";
import RequestWebSocket from "./websocket/request";

export interface SearchHit<T = any> {
  _index: string;
  _id: string;
  _score: number;
  _source: T;
}

export interface SearchResults {
  readonly hits: { hits: any[] };
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
      query: {
        multi_match: {
          query: q,
        },
      },
    };

    const [resp, err] = await withErr(this.ws.doSimpleRequest<SearchResults>(body));
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
