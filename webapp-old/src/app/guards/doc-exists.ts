import 'rxjs/add/operator/take';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/let';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { AppState }   from 'app/store/reducers';
import * as selectors from 'app/store/selectors';
import { RequestOneAction } from 'app/store/actions/db';
import { Property } from 'app/models';

@Injectable()
export class DocExistsGuard implements CanActivate {
  constructor(
    private store: Store<AppState>,
    private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const collection = route.data['collection'];
    const id = route.params['id'];
    return this.store
      .select(selectors.getDoc(collection)(id))
      .map(doc => !!doc)
      .take(1)
      .switchMap(inStore => {
        if (inStore) return of(inStore);

        const action = new RequestOneAction({ collection: collection, id: {$oid: route.params['id']}})
        this.store.dispatch(action);

        return this.store
          .select(selectors.getQueryResult(collection)(action.queryId))
          .filter(qr => !qr.inProgress)
          .map(qr => !qr.fetchError)
      }).catch(() => {
        this.router.navigate(['/404']);
        return of(false);
      });
  }
}
