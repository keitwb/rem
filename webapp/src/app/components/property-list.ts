import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { AppStore }          from 'app/store';
import { Observable }        from 'rxjs/Observable';
import { Subscription }      from 'rxjs/Subscription';
import { Store }             from '@ngrx/store';

import { AppState }          from 'app/store/reducers';
import { getDocsLazily }     from 'app/store/paginator';

import { Property }          from 'app/models';
import * as actions          from 'app/store/actions';
import * as selectors        from 'app/store/selectors';
import { SortOrder, MongoDoc }         from 'app/services/index';

@Component({
  selector: 'rem-property-list',
  template: `
    <ul class="list-group">
      <li *ngFor="let prop of displayedProperties" class="list-group-item">
        <h2><a [routerLink]="[prop._id.$oid]">{{prop.name}}</a></h2>
        <div>{{prop.description}}</div>
        <div *ngIf="prop.county">{{prop.county}} County, {{prop.state}}</div>
      </li>
    </ul>
  `,
  styles: [`
    li {
      list-style: none;
    }
  `]
})
export class PropertyListComponent implements OnInit {
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