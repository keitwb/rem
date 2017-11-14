import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { AppStore }          from 'app/store';
import { Observable }        from 'rxjs/Observable';
import { Subscription }      from 'rxjs/Subscription';
import { Store }             from '@ngrx/store';

import { AppState }          from 'app/store/reducers';
import { getDocsLazily }     from 'app/store/paginator';

import { Property }          from 'app/models';
import * as selectors        from 'app/store/selectors';
import { SortOrder, MongoDoc }         from 'app/services/index';

@Component({
  selector: 'rem-properties',
  template: `
    <rem-property-list [properties]="displayedProperties"></rem-property-list>
  `,
  styles: [`
    li {
      list-style: none;
    }
  `]
})
export class PropertiesComponent implements OnInit {
  displayedProperties: MongoDoc<Property>[];
  properties$: Observable<MongoDoc<Property>>;
  propSub: Subscription;

  filter: object;
  sortBy: string = "name";
  sortOrder: SortOrder = "asc";

  constructor(private store: Store<AppState>, private router: Router) { }

  ngOnInit() {
    this.displayedProperties = [];
    this.properties$ = getDocsLazily<Property>(this.store, {
      collection: Property.collection,
      filter: this.filter,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder});
    this.propSub = this.properties$.subscribe(p => this.displayedProperties.push(p));
  }

  ngOnDestroy() {
    this.propSub.unsubscribe();
  }
}
