import { Observable }                 from 'rxjs/Observable';
import 'rxjs/add/operator/ignoreElements';
import 'rxjs/add/operator/last';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/takeWhile';
import { Injectable } from '@angular/core';
import { ReplaySubject }           from 'rxjs/ReplaySubject';
import { Store }             from '@ngrx/store';
import { AppState }          from 'app/store/reducers';
import { RequestManySuccessAction }        from 'app/store/actions/db';
import * as selectors        from 'app/store/selectors';
import { SortOrder, MongoDoc, MongoClient }         from 'app/services/mongo';
import { Logger }         from 'app/services/logger';
import * as _ from 'lodash';

/** 
 * Ensures that data is fetched from the backend and put in the store.
 */
@Injectable()
export class StoreSyncer {

  constructor(private store: Store<AppState>, private mongo: MongoClient, private logger: Logger) {}

  getSyncedList<T extends MongoDoc>(collection: string,
      params: {filter: object, sortBy: string, sortOrder: SortOrder, pageSize: number}):
        [Observable<any>, Observable<T[]>, () => void] {
    let page = 1;
    const pageRequests$ = new ReplaySubject<number>();
    const {filter, sortBy, sortOrder, pageSize} = params;

    const docs$: Observable<T[]> = pageRequests$
      .concatMap(page => this.mongo.getCollectionPage<T>(collection, {filter, sortBy, sortOrder, page, pageSize}))
      .catch<T[], T[]>(error => { this.logger.error(error.text()); throw error; })
      .takeWhile(docs => docs.length > 0).share();

    const selectors$ = docs$
      .do(docs => this.store.dispatch(new RequestManySuccessAction({collection, docs})))
      .mergeMap(docs => _.map(docs, d => this.store.select(selectors.getDoc(collection)(d._id.$oid))))
      .scan((acc, docObs) => acc.concat(docObs), [])
      .mergeMap(selectedDocs => Observable.combineLatest(selectedDocs));

    return [docs$.last().ignoreElements(), selectors$, () => pageRequests$.next(page++)];
  }
}
