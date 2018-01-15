import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { Observable }        from 'rxjs/Observable';
import { Subscription }        from 'rxjs/Subscription';
import * as _ from 'lodash';

import { Property }          from 'app/models';
import { StoreSyncer } from 'app/services/store-syncer';
import { SortOrder, MongoDoc }         from 'app/services/mongo';

@Component({
  selector: 'rem-properties',
  template: `
    <div class="py-2">
      <rem-property-toolbar></rem-property-toolbar>
    </div>
    <rem-property-list 
      [properties]="properties$ | async"
      [error]="error"
      [hasMore]="hasMore"
      (fetchMore)="this.getNextPage()"
    ></rem-property-list>
  `,
  styles: [`
    li {
      list-style: none;
    }
  `]
})
export class PropertiesComponent implements OnInit {
  properties$: Observable<Property[]>;
  error: string;
  hasMore = true;
  getNextPage: () => void;

  filter: object;
  sortBy: string = "name";
  sortOrder: SortOrder = "asc";

  propertiesSub: Subscription;

  constructor(private syncer: StoreSyncer, private router: Router) { }

  ngOnInit() {
    const [fetches$, properties$, getNextPage] = this.syncer.getSyncedList<Property>(
      Property.collection, {
      filter:    null,
      pageSize:  10,
      sortBy:    "name",
      sortOrder: "asc"});

    getNextPage();
    this.getNextPage = getNextPage;
    this.properties$ = properties$;

    this.propertiesSub = fetches$.subscribe(
      _ => undefined,
      err => { this.error = err; },
      () => { this.hasMore = false });
  }

  ngOnDestroy() {
    this.propertiesSub.unsubscribe();
  }
}
