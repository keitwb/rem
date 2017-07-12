import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { AppStore }          from 'app/store';
import { Observable }        from 'rxjs/Observable';

import { Property } from 'app/models';

@Component({
  selector: 'property-list',
  styles: [],
  template: `
    <ul>
      <li *ngFor="let prop of properties | async">
        <h2><a [routerLink]="[prop.id]">{{prop.name}}</a></h2>
        <div>{{prop.description}}</div>
        <div *ngIf="prop.county">{{prop.county.name}} County, {{prop.county.state}}</div>
      </li>
    </ul>
  `
})
export class PropertyListComponent implements OnInit {
  properties: Observable<Property[]>;

  constructor(private store: AppStore, private router: Router) { }

  ngOnInit() {
    this.properties = this.store.select();
  }

}
