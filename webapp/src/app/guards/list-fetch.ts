import { Store } from '@ngrx/store';
import { Router, Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { AppState }   from 'app/store/reducers';


@Injectable()
class ListResolver implements Resolve<QueryID> {
  constructor(private store: Store<AppState>) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const collection = route.data['collection'];
    const action = new RequestManyAction({
      collection,
      filter:    {},
      startAt:   0,
      pageSize:  number;
      sortBy:    string;
      sortOrder: SortOrder;
    return this.store.dispatch();
  }
}
