import {Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/defaultIfEmpty';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';

import { MongoClient, MongoDoc } from './mongo';
import { Property} from 'app/models';

interface SuggestResult {
  _id: string;
  values: string[];
}

export type SuggestionProvider = (string) => Observable<string[]>;

@Injectable()
export class SuggestorService {
  constructor(private mongo: MongoClient) { }

  suggestCounties(prefix: string): Observable<string[]> {
    return this.mongo.getAggregation<SuggestResult>(Property.collection, "counties", {"re": `^${_.escapeRegExp(prefix)}`})
      .map(o => o.values)
      .defaultIfEmpty([])
      .take(1)
  }

  suggestTest(s: string): Observable<string[]> {
    if (s) {
      return Observable.of(["123", "456"]);
    } else {
      return Observable.of([]);
    }
  }
}
