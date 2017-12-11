import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, Params }      from '@angular/router';
import { Observable }        from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import { Store } from '@ngrx/store';

import { UpdateAction } from 'app/store/actions/db';
import { MongoDoc } from 'app/services/mongo';
import { AppState }   from 'app/store/reducers';
import { Property }   from 'app/models';
import * as selectors from 'app/store/selectors';
import {ModelUpdate} from 'app/services/updates';

@Component({
  selector: 'rem-property-page',
  template: `
    <rem-property
      [property]="property$ | async"
      (update)="save($event)"
      >
  `
  //styles:   []
})
export class PropertyPageComponent implements OnInit {
  property$: Observable<Property>;

  constructor(private route: ActivatedRoute,
              private store: Store<AppState>) { }

  ngOnInit() {
    this.property$ = this.route.params
      .switchMap((params: Params) => this.store
        .select(selectors.getDoc(Property.collection)(params['id'])));
  }

  save({doc, update}: {doc: Property, update: ModelUpdate}) {
    this.store.dispatch(new UpdateAction({
      collection: Property.collection,
      id: doc._id,
      etag: doc._etag,
      update,
    }));
  }
}

