import {Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

import { MongoClient } from './mongo';
import { Property} from 'app/models';

interface SuggestResult {
  _id: String;
  values: String[];
}

@Injectable()
export class SuggestorService {
  constructor(private mongo: MongoClient) { }

  suggestCounties(prefix: string): Observable<String[]> {
    return this.mongo.getAggregation<SuggestResult>(Property.collection, "counties", {"re": `^${_.escapeRegExp(prefix)}`})[1]
      .take(1)
      .map(o => o.values);
  }
}
