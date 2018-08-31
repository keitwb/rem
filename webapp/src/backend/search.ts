import * as axios from "axios";

import { ValOrErr, withErr } from "@/util/errors";

export interface SearchResults {
  readonly hits: object;
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
  private http: axios.AxiosInstance;

  constructor(baseURL: string) {
    this.http = axios.default.create({
      baseURL,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });
  }

  public async query(q: string): Promise<ValOrErr<SearchResults>> {
    const body = JSON.stringify({
      query: {
        multi_match: {
          query: q,
        },
      },
    });

    const [resp, err] = await withErr(this.http.post<SearchResults>("", body));
    if (err) {
      return [null, err];
    }
    return [resp.data, null];
  }

  public async suggest(field: string, index: string, prefix: string): Promise<ValOrErr<string[]>> {
    const reqBody = JSON.stringify({
      suggest: {
        current: {
          completion: {
            field: `${field}.completion`,
          },
          prefix,
        },
      },
    });

    const [resp, err] = await withErr(this.http.post<CompletionResult>(`/${index}/_search`, reqBody));
    if (err) {
      return [null, err];
    }

    return [resp.data.suggest.current.options.map(o => o.text), null];
  }
}
