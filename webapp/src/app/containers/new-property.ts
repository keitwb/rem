import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable }        from 'rxjs/Observable';
import { Subscription }      from 'rxjs/Subscription';
import 'rxjs/add/operator/partition';
import * as uuid from 'uuid/v4';

import { Property, PropertyType } from 'app/models';
import { MongoDoc }               from 'app/services/index';
import { AppState }               from 'app/store/reducers';
import * as selectors               from 'app/store/selectors';
import { CreateAction } from 'app/store/actions/db';
import { CreateResult } from 'app/store/reducers/db';

@Component({
  selector: 'rem-new-property',
  template: `
  <rem-property-create (create)="submit($event)" [error]="error$ | async">
  </rem-property-create>
  `,
  styles: [` `]
})
export class NewPropertyComponent {

  createId: string;
  resultSub: Subscription;
  error$: Observable<CreateResult>;

  constructor(private store: Store<AppState>, private router: Router) {
    this.createId = uuid();
  }

  ngOnInit() {
    const [error$, complete$] =
      this.store.select(selectors.getCreateResult(Property.collection)(this.createId))
        .filter(res => res && res.inProgress === false)
        .partition(res => !!res.error);

    this.error$ = error$.map(res => res.error);

    this.resultSub = complete$.subscribe(res => this.complete(res.docId));
  }

  complete(docId: string) {
    this.router.navigate([`/properties/${docId}`]);
  }

  ngOnDestroy() {
    this.resultSub.unsubscribe();
  }

  submit(model: Property) {
    this.store.dispatch(new CreateAction({
      collection: Property.collection,
      createId: this.createId,
      model,
    }));
  }
}
