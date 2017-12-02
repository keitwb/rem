import {Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/defaultIfEmpty';
import * as _ from 'lodash';

import { MongoClient } from './mongo';
import { Property} from 'app/models';

interface SuggestResult {
  _id: string;
  values: string[];
}

@Injectable()
export class SuggestorService {
  constructor(private mongo: MongoClient) { }

  suggestCounties(prefix: string): Observable<string[]> {
    return this.mongo.getAggregation<SuggestResult>(Property.collection, "counties", {"re": `^${_.escapeRegExp(prefix)}`})[1]
      .map(o => o.values)
      .defaultIfEmpty([])
      .take(1)
  }
}
