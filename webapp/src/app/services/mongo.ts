import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Injectable }                              from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable }                              from 'rxjs/Observable';
import * as _                                      from 'lodash';

import {SortOrder}                                 from '.';
import {ModelUpdate} from './updates';
import {AppConfig}                                 from 'app/config';
import {Model}                                 from 'app/models';

export type MongoID = { $oid: string };

export interface MongoDoc<T> {
  _id:          MongoID;
  _links:       { [id:string]: { href: string } };
  _etag:        MongoID;
  _createdDate: { $date: number };
  _updates:     MongoUpdate[],
}

interface MongoUpdate {
  'type': string;
  update: object;
}

export interface ListResult<T> {
  docs:       MongoDoc<T>[];
  size:       number;
  totalPages: number;
}

interface Rel {
  refField:   string;
  targetColl: string;
  role:       string;
  'type':     string;
}

interface CollectionRels {
  [index: string /* Collection name */]: {[index: string /* relation name */]: Rel};
}

export type ETag = {$oid: string};

class LinkManager {
  private _links: Observable<CollectionRels>

  constructor(private http: Http, private baseUrl: URL) { }

  getLinks(): Observable<CollectionRels> {
    if (!this._links) {
      this._links = this.http.get(this.baseUrl.href)
        .map(r => r.json())
        .map(d => d["_embedded"])
        .map(arr => _.reduce(arr, (acc, colRels) => {
          acc[colRels["_id"]] = _.reduce(colRels["rels"], (acc2, r) => {
            acc2[r["rel"]] = <Rel>{
              refField: r["ref-field"],
              targetColl: r["target-coll"],
              role: r["role"],
              'type': r["type"],
            };
            return acc2;
          }, {});
          return acc;
        }, {}));
    }
    return this._links;
  }
}

@Injectable()
export class MongoVersioningClient {
  private linkManager: LinkManager
  private baseUrl: URL;

  constructor(private http: Http, private config: AppConfig) {
    this.baseUrl = new URL(config.dbPath, window.location.href);

    // Make sure the base url path ends in "/" for easier processing later
    if (!this.baseUrl.pathname.endsWith("/")) {
      this.baseUrl.pathname += "/";
    }
    this.linkManager = new LinkManager(http, this.baseUrl);
  }

  getRequestOptions(etag: ETag = null): RequestOptions {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
    if (etag) {
      headers.set("If-Match", etag.$oid);
    }
    return (new RequestOptions({headers}));
  }

  getUrl(path: string): URL {
    const url = new URL(this.baseUrl.href);
    url.pathname += path;
    return url;
  }

  private raiseTextError<T>(res: Response): Observable<T> {
    try {
      const data = res.json();
      if (data && data.message) return Observable.throw(data.message);
    } catch(e) {}
    return Observable.throw(res.text() || "Unknown Error");
  }

  // Since RESTHeart doesn't return the new doc upon creation, go fetch it
  // based on the Location header returned.
  private fetchNew<T>(res: Response): Observable<MongoDoc<T>> {
    if (res.status != 201) {
      throw `Document was not created: ${res.toString()}`;
    }

    const url = new URL(res.headers.get("Location"));
    const [id, collection] = url.pathname.split("/").reverse();
    return this.getOne(collection, {$oid: id});
  }

  fetchRelated<T, R>(doc: MongoDoc<T>, relName: string): Observable<MongoDoc<R>[]> {
    if (!doc._links[relName] || !doc._links[relName].href) {
      return Observable.of([]);
    }

    const rel = doc._links[relName];
    return this.http.get(rel.href)
      .map((r) => r.json())
  }

  getList<T>(collection: string, params: {filter: object, page: number, pageSize: number, sortBy: string, sortOrder: SortOrder}): Observable<ListResult<T>> {
    const ordering_flag = params.sortOrder == "asc" ? "" : "-1";
    const url = this.getUrl(collection);
    url.searchParams.set("page", String(params.page));
    url.searchParams.set("pagesize", String(params.pageSize));
    url.searchParams.set("sort_by", params.sortBy);
    // This makes it return pagination stats
    url.searchParams.set("count", "");
    if (params.filter) {
      url.searchParams.set("filter", JSON.stringify(params.filter));
    }

    return this.http.get(url.href)
      .map(r => r.json())
      .map(o => ({
        docs: o._embedded,
        size: o._size,
        totalPages: o._total_pages,
      }));
  }

  getOne<T>(collection: string, id: MongoID): Observable<MongoDoc<T>> {
    const url = this.getUrl(`${collection}/${id.$oid}`);
    return this.http.get(url.href).map((r) => r.json());
  }

  create<T>(collection: string, obj: T): Observable<MongoDoc<T>> {
    const path = `${collection}`;
    const bodyObj = {
                      $set: _.merge({}, 
                        obj,
                        {
                          "_createdDate": (new Date()).toJSON(),
                          "_updates": [],
                        }
                      ),
                    };

    const url = this.getUrl(path);
    url.search = "checkEtag";

    return this.http.post(url.href, JSON.stringify(bodyObj), this.getRequestOptions())
      .switchMap((r) => this.fetchNew<T>(r))
      .catch((e) => this.raiseTextError<MongoDoc<T>>(e));
  }

  update<T>(collection: string, id: MongoID, etag: ETag, updates: ModelUpdate[]): Observable<MongoDoc<T>> {
    const path = `${collection}/${id}`;
    const bodyObj = _.merge({}, ..._.map(updates, u => u.updateObj));

    const url = this.getUrl(path);
    url.search = "checkEtag";

    return this.http.patch(url.href, JSON.stringify(bodyObj), this.getRequestOptions(etag))
      .switchMap((r) => this.getOne<T>(collection, id))
      .catch((e) => this.raiseTextError<MongoDoc<T>>(e))
  }
}

