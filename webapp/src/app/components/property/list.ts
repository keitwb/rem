import { Component, Input } from '@angular/core';

import { Property }          from 'app/models';
import { MongoDoc }         from 'app/services/index';

@Component({
  selector: 'rem-property-list',
  template: `
    <ul class="list-group">
      <li *ngFor="let prop of properties" class="list-group-item">
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
export class PropertyListComponent {
  @Input() properties: MongoDoc<Property>[];
}
