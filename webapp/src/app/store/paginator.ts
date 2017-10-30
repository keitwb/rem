import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import { Observable }        from 'rxjs/Observable';
import { Store }             from '@ngrx/store';

import { AppState }          from 'app/store/reducers';

import * as selectors        from './selectors';
import { SortOrder, MongoDoc }         from 'app/services/index';
import { RequestManyAction, RequestManyPayload } from 'app/store/actions/db';

// Creates an Observable that outputs Model instances, fetching them from Mongo
// lazily as they are pulled from the observable.
export function getDocsLazily<T>(
    store: Store<AppState>,
    {collection,
     filter,
     sortBy,
     sortOrder}:
    {collection: string,
     filter: object,
     sortBy: string,
     sortOrder: SortOrder}): Observable<MongoDoc<T>> {

  function fetchIdsLazily({page, pageSize}: {page: number, pageSize: number}) {
    return Observable.defer(() => {
      const action = new RequestManyAction({collection, filter, sortBy, sortOrder, page, pageSize})
      store.dispatch(action);

      const queryResult$ = store.select(selectors.getQueryResult(collection)(action.queryId));
      return queryResult$
          .filter(qr => qr && !qr.inProgress)
          .first()
          .mergeMap(qr => {
            const id$ = Observable.from(qr.docIds);
            const nextPage = page + 1;
            const next$ = qr.totalPages >= nextPage
                            ? fetchIdsLazily({page: nextPage, pageSize})
                            : Observable.empty();

            return Observable.concat(id$, next$);
          });
    });
  };

  return fetchIdsLazily({page: 1, pageSize: 10})
    .switchMap(id => store.select(selectors.getDoc(collection)(id.$oid)).first());
}

