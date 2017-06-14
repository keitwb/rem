import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { of }         from 'rxjs/observable/of';
import * as _         from 'lodash';

import { Property, County, Lease, Document, Note, Contact } from './models';


type Model = Property | County | Lease | Document | Note | Contact;
type CacheEntry = {etag: string, previous: Model};

@Injectable()
export class PropertyService {

  cache: { [index:string]: { [index:string]: CacheEntry } };
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

  getPrevious(obj: Model): Model {
    return this.cache[obj.kind][obj.id].previous;
  }

  private base_path(kind: string): string {
    switch (kind) {
      case "property": return "/properties";
      case "county": return "/counties";
    }
  }

  private extractSingleFromResponse(kind: string, res: Response): Model {
    return this.processSingle(kind, res.json());
  }

  private processSingle(kind: string, data: any) {
    const model = _.cloneDeep(data.current);
    model.id = data["_id"]["$oid"];

    const cacheEntry: CacheEntry = {
      etag: data["_etag"]["$oid"],
      previous: model,
    };

    this.cache[kind][model.id] = cacheEntry;

    return model;
  }

  private extractListFromResponse(kind: string, res: Response): Model[] {
    const data = res.json();
    return _.map(data._embedded, _.partial(this.processSingle, kind));
  }

  private updateCacheForUpdate(model: Model, res: Response) {
    this.cache[model.kind][model.id] = {
      etag: res.headers.get('ETag'),
      previous: model,
    };
  }

  // `kind` should be one of the `kind` attributes of a Model.  It is a hack
  // needed in order to get the type of the model since TS erases all types
  // upon translation to JS.
  private get_list(kind: string): Observable<Model[]> {
    return this.http.get(this.base_path(kind)).
      map(_.partial(this.extractListFromResponse, kind));
  }

  private get_one(id: string, kind: string): Observable<Model> {
    return this.http.get(`${this.base_path(kind)}/${id}`).
      map(_.partial(this.extractSingleFromResponse, kind));
  }

  private raiseTextError(res: Response): never {
    try {
      const data = res.json();
      if (data && data.message) throw data.message;
    } catch(e) {}

    throw "Unknown error";
  }


  private post(path: string, body: object): Observable<Response> {
    return this.http.post(path, JSON.stringify(body), this.httpOptions).catch(this.raiseTextError);
  }

  private patch(path: string, body: object): Observable<Response> {
    return this.http.patch(path, JSON.stringify(body), this.httpOptions).catch(this.raiseTextError);
  }

  create(obj: Model): Observable<string> {
    const path = `${this.base_path(obj.kind)}/${obj.id}`;
    const bodyObj = {
                      "current": obj,
                      "prev": [],
                    };

    return this.post(path, bodyObj).do(_.partial(this.updateCacheForUpdate, obj));
  }

  update(obj: Model): Observable<string> {
    const path = `${this.base_path(obj.kind)}/${obj.id}?etag=${this.getEtag(obj)}`;
    const bodyObj = {
                   "$set": {"current": obj },
                   "$push": {"prev": this.getPrevious(obj)}
                 };

    return this.patch(path, bodyObj).do(_.partial(this.updateCacheForUpdate, obj));
  }

  getProperties(): Observable<Property[]> {
    return this.get_list((<Property>{}).kind);
  }

  getProperty(id: string): Observable<Property> {
    return this.get_one(id, (<Property>{}).kind);
  }
}
