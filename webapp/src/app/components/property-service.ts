import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { of }         from 'rxjs/observable/of';
import { Store }      from '@ngrx/store';
import * as _         from 'lodash';

import { Property, Lease, Media, Note, Contact, User } from './models';


type Model = Property | Lease | Media | Note | Contact | User;
type ModelState = { [index:string]: {etag: string, model: Model} };

type SortOrdering = "asc" | "desc"

class MongoVersioningClient {
  constructor(private http: Http, private kindToPath: {[index:string]: string}) {
  }

  getRequestOptions(etag: string = null): RequestOptions {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
    if (etag) {
      headers.set("If-Match", etag);
    }
    return (new RequestOptions({headers}));
  }

  getEtag(obj: Model): string {
    return this.cache[obj.constructor["kind"]][obj.id].etag;
  }

  getPrevious(obj: Model): Model {
    return this.cache[obj.constructor["kind"]][obj.id].previous;
  }

  private base_path(kind: string): string {
    if (!(kind in this.kindToPath)) {
      throw `Model kind $kind not in client map: $this.kindToPath`;
    }
    return this.kindToPath[kind];
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

  private updateCacheForUpdate(model: Model, res: Response): Model {
    let id string;
    if (res.status == 201) {
      const href = res.headers.get("Location");
      id = href.split("/").pop();
      model.id = id;
    }
    else {
      id = model.id;
    }

    if (!id) throw `Model ID not found: $model; $res`;

    this.cache[model.constructor["kind"]][id] = {
      etag: res.headers.get('ETag'),
      previous: model,
    };

    return model;
  }

  private raiseTextError(res: Response): never {
    try {
      const data = res.json();
      if (data && data.message) throw data.message;
    } catch(e) {}

    throw "Unknown error";
  }


  private post(path: string, body: object): Observable<Response> {
    return this.http.post(path, JSON.stringify(body), this.getRequestOptions()).catch(this.raiseTextError);
  }

  private patch(path: string, body: object, etag: string): Observable<Response> {
    return this.http.patch(path, JSON.stringify(body), this.getRequestOptions(etag)).catch(this.raiseTextError);
  }

  // `kind` should be one of the `kind` attributes of a Model.
  get_list(kind: string, params: {page: number, count: number, sort_by: string, order: SortOrdering}): Observable<Model[]> {
    const ordering_flag = order == "asc" ? "" : "-1";
    const url = `${this.base_path(kind)}?page=${params.page}&pagesize=${params.count}` +
                `&sort_by=${ordering_flag}${params.sort_by}`;

    return this.http.get(url).map(_.partial(this.extractListFromResponse, kind));
  }

  get_one(id: string, kind: string): Observable<Model> {
    return this.http.get(`${this.base_path(kind)}/${id}`).
      map(_.partial(this.extractSingleFromResponse, kind));
  }

  create<T extends Model>(obj: T): Observable<T> {
    const path = `${this.base_path(obj.constructor["kind"])}/${obj.id}?checkEtag`;
    const bodyObj = {
                      "current": obj,
                      "prev": [],
                    };

    return this.post(path, bodyObj).map(_.partial(this.updateCacheForUpdate, obj));
  }

  update<T extends Model>(obj: T): Observable<T> {
    const path = `${this.base_path(obj.constructor["kind"])}/${obj.id}?checkEtag`;
    const bodyObj = {
                   "$set": {"current": obj },
                   "$push": {"prev": this.getPrevious(obj)}
                 };

    return this.patch(path, bodyObj, this.getEtag(obj))
               .map(_.partial(this.updateCacheForUpdate, obj));
  }
}

@Injectable()
export class PropertyService {
  kindToPath = {
    property: "/properties",
    lease: "/leases",
    contact: "/contacts",
    media: "/media.files",
    note: "/notes",
    user: "/users",
  }
  client: MongoVersioningClient

  constructor(private http: Http, private store: Store<AppState>) {
    this.client = new MongoVersioningClient(http, this.kindToPath);
  }

  getProperties({page = 1, count = 10, sort_by = 'name', order = 'asc'} = {}): Observable<Property[]> {
    return this.client.get_list(Property.kind, {page, count, sort_by, order});
  }

  getProperty(id: string): Observable<Property> {
    return this.client.get_one(id, Property.kind);
  }

  create<T extends Model>(obj: T): Observable<T> {
    return this.client.create(obj);
  }


}
