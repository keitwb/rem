import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, Params }      from '@angular/router';
import { Observable }        from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import { Store } from '@ngrx/store';

import { UpdateAction } from 'app/store/actions/db';
import { MongoDoc } from 'app/services/mongo';
import { AppState }   from 'app/store/reducers';
import { Property, Media }   from 'app/models';
import * as selectors from 'app/store/selectors';
import {ModelUpdate} from 'app/util/updates';

@Component({
  selector: 'rem-property-page',
  template: `
    <rem-property
      [property]="property$ | async"
      [media]="mediaFiles$ | async"
      (update)="save($event)"
      >
  `
  //styles:   []
})
export class PropertyPageComponent implements OnInit {
  property$: Observable<Property>;
  mediaFiles$: Observable<Media[]>;

  constructor(private route: ActivatedRoute,
              private store: Store<AppState>) { }

  ngOnInit() {
    const id$ = this.route.params.map(p => p.id);
    this.property$ = id$.switchMap(id => this.store.select(selectors.getDoc(Property.collection)(id))).share();
    //this.mediaFiles$ = this.store.select(selectors.getDocs
    //this.mediaFiles$ = this.property$.switchMap(prop => {
      //return this.{
        //[Property.collection]: [prop._id],
        //[Lease.collection]: prop.leases,
        //[Note.collection]: prop.notes,
      //};
    //});
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

