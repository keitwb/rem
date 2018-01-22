import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/defaultIfEmpty';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/of';
import escapeRegExp from 'lodash-es/escapeRegExp';

import { MongoDoc, getAggregation } from './mongo';
import { Property} from '@/models';

interface SuggestResult {
  _id: string;
  values: string[];
}

export type SuggestionProvider = (t: string) => Observable<string[]>;

export function suggestCounties(prefix: string): Observable<string[]> {
  return getAggregation<SuggestResult>(Property.collection, "counties", {"re": `^${escapeRegExp(prefix)}`})
    .map(o => o.values)
    .defaultIfEmpty([])
    .take(1)
}

export function suggestTest(s: string): Observable<string[]> {
  if (s) {
    return Observable.of(["123", "456"]);
  } else {
    return Observable.of([]);
  }
}
