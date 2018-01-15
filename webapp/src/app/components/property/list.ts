import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Observable }        from 'rxjs/Observable';
import 'rxjs/add/observable/range';

import { Property }          from 'app/models';
import { MongoDoc }         from 'app/services/index';

@Component({
  selector: 'rem-property-list',
  template: `
    <div *ngIf="error">Error fetching properties: {{ error }}</div>
    <ul infiniteScroll (scrolled)="fetchMore.emit()" class="list-group">
      <li *ngFor="let prop of properties" class="list-group-item">
        <h2><a [routerLink]="[prop._id.$oid]">{{prop.name}}</a></h2>
        <div>{{prop.description}}</div>
        <div *ngIf="prop.county">{{prop.county}} County, {{prop.state}}</div>
      </li>
    </ul>
    <div *ngIf="!hasMore">End of results</div>
    <a *ngIf="hasMore" (click)="fetchMore.emit()">Load More</a>
  `,
  styles: [`
    li {
      list-style: none;
    }
  `]
})
export class PropertyListComponent {
  @Input() properties: Property[];
  @Input() error: string;
  @Input() hasMore: boolean;
  @Output() fetchMore = new EventEmitter();
}
