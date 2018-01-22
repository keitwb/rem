import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/takeUntil';
import { Injectable }                 from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Action }                     from '@ngrx/store';
import { Observable }                 from 'rxjs/Observable';
import { of }                         from 'rxjs/observable/of';
import * as search                    from 'app/store/actions/search';
import {SearchClient} from 'app/services/search';

@Injectable()
export class SearchEffects {

  @Effect()
  search$ = this.actions$
    .ofType(search.SEARCH)
    .switchMap((action: search.SearchAction) => {
      const {query} = action.payload;

      const nextSearch$ = this.actions$.ofType(search.SEARCH).skip(1);

      return this.searchClient.query(query)
        .takeUntil(nextSearch$)
        .map(results => new search.SearchCompleteAction({results}))
        .catch(error => Observable.of(new search.SearchFailureAction({error})));
    });

  constructor(private actions$: Actions, private searchClient: SearchClient) { }
}
