import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/takeUntil';
import { Injectable }                 from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Action }                     from '@ngrx/store';
import { Observable }                 from 'rxjs/Observable';
import { empty }                      from 'rxjs/observable/empty';
import { of }                         from 'rxjs/observable/of';
import * as db                        from 'app/store/actions/db';
import { MongoVersioningClient }      from 'app/services/mongo';

@Injectable()
export class DBEffects {

  @Effect()
  requestMany$ = this.actions$
    .ofType(db.REQUEST_MANY)
    .switchMap((action: db.RequestManyAction) => {
      const {collection, filter, page, pageSize, sortBy, sortOrder} = action.payload;
      const queryId = action.queryId;
      const nextRequest$ = this.actions$.ofType(db.REQUEST_MANY).skip(1);

      return this.mongo.getList(collection, {filter, page, pageSize, sortBy, sortOrder})
        .takeUntil(nextRequest$)
        .map(listRes => new db.RequestManySuccessAction({
          collection, filter, page, pageSize, sortBy, sortOrder, queryId, ...listRes,
        }))
        .catch(error => Observable.of(new db.RequestFailureAction({error, queryId, collection})));
    });

  @Effect()
  requestOne$ = this.actions$
    .ofType(db.REQUEST_ONE)
    .switchMap((action: db.RequestOneAction) => {
      const {collection, id} = action.payload;
      const queryId = action.queryId;
      const nextRequest$ = this.actions$.ofType(db.REQUEST_ONE).skip(1);

      return this.mongo.getOne(collection, id)
        .takeUntil(nextRequest$)
        .map(doc => new db.RequestOneSuccessAction({doc, collection}))
        .catch(error => Observable.of(new db.RequestFailureAction({error, queryId, collection})));
    });

  @Effect()
  create$ = this.actions$
    .ofType(db.CREATE)
    .switchMap((action: db.CreateAction) => {
      const {collection, createId, model} = action.payload;

      const nextRequest$ = this.actions$.ofType(db.CREATE).skip(1);

      return this.mongo.create(collection, model)
        .takeUntil(nextRequest$)
        .map(doc => new db.CreateSuccessAction({collection, createId, doc}))
        .catch(error => Observable.of(new db.CreateFailureAction({error, createId, collection})));
    });

  @Effect()
  update$ = this.actions$
    .ofType(db.UPDATE)
    .switchMap((action: db.UpdateAction) => {
      const {collection, id, etag, update} = action.payload;

      const nextRequest$ = this.actions$.ofType(db.UPDATE).skip(1);

      return this.mongo.update(collection, id, etag, [update])
        .takeUntil(nextRequest$)
        .map(doc => new db.UpdateSuccessAction({collection, doc}))
        .catch(error => Observable.of(new db.UpdateFailureAction({error, collection, id})));
    });

  constructor(private actions$: Actions, private mongo: MongoVersioningClient) { }
}
