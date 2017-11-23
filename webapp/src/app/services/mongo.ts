import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import { Observable }                              from 'rxjs/Observable';
import { Subject }                              from 'rxjs/Subject';
import { Injectable }                              from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import * as _                                      from 'lodash';

import {SortOrder}                                 from '.';
import {ModelUpdate} from './updates';
import {AppConfig}                                 from 'app/config';

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
  _returned:       MongoDoc<T>[];
  _size:       number;
  _totalPages: number;
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
export class MongoClient {
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

  getAggregation<T>(collection: string, name: string, params: object): [Observable<number>, Observable<T>] {
    const url = this.getUrl(`${collection}/_aggrs/${name}`);
    url.searchParams.set("avars", JSON.stringify(params));
    return this.streamEmbeddedDocs(url);
  }

  streamEmbeddedDocs<T>(url: URL): [Observable<number>, Observable<T>] {
    const self = this;
    const sizeObs = new Subject<number>();

    function fetchLazily({page, pageSize}: {page: number, pageSize: number}): Observable<T> {
      const pageUrl = new URL(url.href);
      pageUrl.searchParams.set("page", String(page));
      pageUrl.searchParams.set("pagesize", String(pageSize));

      return Observable.defer(() => {
        const page$ = self.http.get(pageUrl.href).map(r => r.json())

        return page$.mergeMap(resp => {
          const doc$: Observable<T> = Observable.from(resp._embedded);
          const nextPage = page + 1;
          const next$ = resp._total_pages >= nextPage
                          ? fetchLazily({page: nextPage, pageSize})
                          : Observable.empty<T>();

          if (page === 1) {
            sizeObs.next(resp._size);
            sizeObs.complete();
          }
          return Observable.concat(doc$, next$);
        });
      });
    };

    return [sizeObs, fetchLazily({page: 1, pageSize: 10})];
  }

  getList<T>(collection: string, params: {filter: object, sortBy: string, sortOrder: SortOrder}): [Observable<number>, Observable<T>] {
    const ordering_flag = params.sortOrder == "asc" ? "" : "-1";
    const url = this.getUrl(collection);
    url.searchParams.set("sort_by", params.sortBy);
    // This makes it return pagination stats
    url.searchParams.set("count", "");
    if (params.filter) {
      url.searchParams.set("filter", JSON.stringify(params.filter));
    }

    return this.streamEmbeddedDocs<T>(url);
  }

  getOne<T>(collection: string, id: MongoID): Observable<MongoDoc<T>> {
    const url = this.getUrl(`${collection}/${id.$oid}`);
    return this.http.get(url.href).map(r => r.json());
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
    const path = `${collection}/${id.$oid}`;
    const bodyObj = _.merge({}, ..._.map(updates, u => u.updateObj));

    const url = this.getUrl(path);
    url.search = "checkEtag";

    return this.http.patch(url.href, JSON.stringify(bodyObj), this.getRequestOptions(etag))
      .switchMap((r) => this.getOne<T>(collection, id))
      .catch((e) => this.raiseTextError<MongoDoc<T>>(e))
  }
}

