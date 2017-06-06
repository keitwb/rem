import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { of }         from 'rxjs/observable/of';

import { Property } from './models';

@Injectable()
export class PropertyService {
  constructor (private http: Http) {}

  getProperties(): Observable<Property[]> {
    return of([<Property>{id: 1, name: 'River Tract'}]);
  }
}
