import { Observable }                 from 'rxjs/Observable';
import * as http from '@/util/http';

import * as config from '@/config';

const baseUrl = new URL(config.searchURL);

export interface SearchResults {
  hits: object;
}

export function query(q: string): Observable<SearchResults> {
  return http.post<SearchResults>(baseUrl.href, JSON.stringify({
      query: {
        multi_match: {
          query: q,
        },
      },
    }), new Headers({accept: 'application/json'}))
  .map(r => r.json);
}
