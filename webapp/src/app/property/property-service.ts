import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { of }         from 'rxjs/observable/of';

import { Property, County, Lease, Document, Note, Contact } from './models';


type Model = Property | County | Lease | Document | Note | Contact;

@Injectable()
export class PropertyService {

  cache: { [index:string]: { [index:string]: {etag: string, version: number, previous: Model} } };
  httpOptions: RequestOptions;

  constructor (private http: Http) {
    this.cache = {
      property: {},
      county: {},
    };

    const headers = new Headers({ 'Content-Type': 'application/json' });
    this.httpOptions = new RequestOptions({headers});
  }

  getEtag(obj: Model): string {
    return this.cache[obj.kind][obj.id].etag;
  }

  getNextVersion(obj: Model): number {
    return this.cache[obj.kind][obj.id].version + 1;
  }

  getPrevious(obj: Model): Model {
    return this.cache[obj.kind][obj.id].previous;
  }

  private base_path(obj: Model): string {
    switch (obj.kind) {
      case "property": return "/properties";
      case "county": return "/counties";
    }
  }

  private extractData(res: Response) {
    return res.json();
  }

  // `obj` should be a dummy instance of a Model.  It is needed in order to get
  // the type from it.
  private get_list(obj: Model): Observable<Model[]> {
    return this.http.get(this.base_path(obj)).map(this.extractData);
  }

  private get_one(id: string, obj: Model): Observable<Model> {
    return this.http.get(`${this.base_path(obj)}/${id}`).map(this.extractData);
  }

  private post(path: string, body: object): Observable<string> {
    return this.http.post(path, JSON.stringify(body), this.httpOptions).catch(err => of(err));
  }

  private patch(path: string, body: object): Observable<string> {
    return this.http.patch(path, JSON.stringify(body), this.httpOptions).catch(err => of(err));
  }

  create(obj: Model): Observable<string> {
    const path = `${this.base_path(obj)}/${obj.id}`;
    const bodyObj = {
                      "current": Object.assign({}, {v: 1}, obj),
                      "prev": [],
                    };
    return this.post(path, bodyObj);
  }

  update(obj: Model): Observable<string> {
    const path = `${this.base_path(obj)}/${obj.id}?etag=${this.getEtag(obj)}`;
    const bodyObj = {
                   "$set": {"current": Object.assign({}, {v: this.getNextVersion(obj)}, obj) },
                   "$push": {"prev": this.getPrevious(obj)}
                 };
    return this.patch(path, bodyObj);
  }

  getProperties(): Observable<Property[]> {
    return this.get_list(<Property>{});
  }

  getProperty(id: string): Observable<Property> {
    return this.get_one(id, <Property>{});
  }
}
