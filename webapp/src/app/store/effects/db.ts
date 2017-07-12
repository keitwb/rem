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
    .map(toPayload)
    .switchMap(({collection, filter, page, count, sort_by, order}) => {
       return this.mongo.getList(collection, {filter, page, count, sort_by, order})
         .map(listRes => new db.RequestManySuccessAction({
           collection, filter, page, count, sort_by, order, ...listRes,
         }))
         .catch(error => Observable.of(new db.RequestFailureAction({error, collection})));
    });

  @Effect()
  requestOne$: Observable<Action> = this.actions$
    .ofType(db.REQUEST_ONE)
    .map(toPayload)
    .switchMap(({collection, id}) => {
      return this.mongo.getOne(id, collection)
        .map(doc => new db.RequestOneSuccessAction({doc, collection}))
        .catch(error => Observable.of(new db.RequestFailureAction({error, collection})));
    });

    constructor(private actions$: Actions, private mongo: MongoVersioningClient) { }
}
