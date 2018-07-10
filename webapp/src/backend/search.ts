import * as axios from "axios";

import { ValOrErr, withErr } from "@/util/errors";

export interface SearchResults {
  hits: object;
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

  public suggestCounties(prefix: string): Promise<string[]> {
    const body = JSON.stringify({
      (CollectionName.Property, "counties", { re: `^${escapeRegExp(prefix)}` })
      .map(o => o.values)
      .defaultIfEmpty([])
      .take(1);
  }
}
