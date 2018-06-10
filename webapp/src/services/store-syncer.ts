import { Observable }                 from 'rxjs/Observable';
import 'rxjs/add/operator/ignoreElements';
import 'rxjs/add/operator/last';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/takeWhile';
import map from 'lodash-es/map';
import {Store} from 'vuex';
import { ReplaySubject }           from 'rxjs/ReplaySubject';
import { makeLoadCommit, DBState }        from '@/store/db';
import { SortOrder, MongoDoc, MongoID, getCollectionPage }         from '@/services/mongo';
import { logger }         from '@/services/logger';

/** 
 * Ensures that data is fetched from the backend and put in the store.
 */
export const getSyncedList = 
    <T extends MongoDoc>(collection: string, params: {filter: object, sortBy: string, sortOrder: SortOrder, pageSize: number}) =>
    (store: Store<DBState>): {done$: Observable<any>, docIds$: Observable<MongoID[]>, fetchMore: () => void} => {
  let page = 1;
  const pageRequests$ = new ReplaySubject<number>();
  const {filter, sortBy, sortOrder, pageSize} = params;

  const docs$: Observable<T[]> = pageRequests$
    .concatMap(page => getCollectionPage<T>(collection, {filter, sortBy, sortOrder, page, pageSize}))
    .catch<T[], T[]>(error => { logger.error(error.text()); throw error; })
    .takeWhile(docs => docs.length > 0).share();

  const selectors$ = docs$
    .do(docs => store.commit(makeLoadCommit({collection, docs})))
    .scan((acc, docs) => acc.concat(map(docs, d => d._id)), <MongoID[]>[]);

  return {
    done$: docs$.last().ignoreElements(),
    docIds$: selectors$,
    fetchMore: () => pageRequests$.next(page++)
  };
}
