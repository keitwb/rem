import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { PropertyService } from './property-service';
import { Property } from './models';

@Component({
  selector: 'property-list',
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.css']
})
export class PropertyListComponent implements OnInit {
  properties: Observable<Property[]>;

  constructor(private propertyService: PropertyService, private router: Router) { }

  ngOnInit() {
    this.properties = this.propertyService.getProperties();
  }
}
