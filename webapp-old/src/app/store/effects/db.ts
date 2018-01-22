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
import { MongoClient }      from 'app/services/mongo';

@Injectable()
export class DBEffects {

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
        .catch(error => Observable.of(new db.RequestFailureAction({error: error.text(), queryId, collection})));
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
        .catch(error => Observable.of(new db.UpdateFailureAction({error: error.text(), collection, id})));
    });

  constructor(private actions$: Actions, private mongo: MongoClient) { }
}
