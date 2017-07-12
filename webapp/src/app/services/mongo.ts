import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Injectable }                              from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable }                              from 'rxjs/Observable';
import * as _                                      from 'lodash';
import {SortOrder}                                 from '.';

export interface MongoDoc<T> {
  _id:         { $oid: string };
  //_collection: string;
  _links:      { [id:string]: { href: string } };
  etag:        string;
  createdDate: { $date: number };
  current:     T;
  prev:        T[],
}

export interface ListResult<T> {
  docs:       MongoDoc<T>[];
  returned:   number;
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

  constructor(private http: Http, private baseUrl: URL) {
    // Make sure the base url path ends in "/" for easier processing later
    if (!this.baseUrl.pathname.endsWith("/")) {
      this.baseUrl.pathname += "/";
    }
    this.linkManager = new LinkManager(http, baseUrl);
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
    return this.getOne(id, collection);
  }

  fetchRelated<T, R>(doc: MongoDoc<T>, relName: string): Observable<MongoDoc<R>[]> {
    if (!doc._links[relName] || !doc._links[relName].href) {
      return Observable.of([]);
    }

    const rel = doc._links[relName];
    return this.http.get(rel.href)
      .map((r) => r.json())
  }

  getList<T>(collection: string, params: {filter: object, page: number, count: number, sort_by: string, order: SortOrder}): Observable<ListResult<T>> {
    const ordering_flag = params.order == "asc" ? "" : "-1";
    const url = new URL(this.baseUrl.href);
    url.pathname += collection;
    url.searchParams.set("page", String(params.page));
    url.searchParams.set("pagesize", String(params.count));
    url.searchParams.set("sort_by", params.sort_by);
    // This makes it return pagination stats
    url.searchParams.set("count", "");
    if (params.filter) {
      url.searchParams.set("filter", JSON.stringify(params.filter));
    }

    return this.http.get(url.href)
      .map(r => r.json())
      .map(o => ({
        docs: o._embedded,
        returned: o._returned,
        size: o._size,
        totalPages: o._total_pages,
      }));
  }

  getOne<T>(collection: string, id: string): Observable<MongoDoc<T>> {
    const url = new URL(this.baseUrl.href);
    url.pathname += `${collection}/${id}`;
    return this.http.get(url.href).map((r) => r.json());
  }

  create<T>(collection: string, obj: T): Observable<MongoDoc<T>> {
    const path = `${collection}`;
    const bodyObj = {
                      $set: {
                        "createdDate": (new Date()).toJSON(),
                        "current": obj,
                        "prev": [],
                      },
                    };

    const url = new URL(this.baseUrl.href);
    url.pathname += path;
    return this.http.post(url.href, JSON.stringify(bodyObj), this.getRequestOptions())
      .switchMap((r) => this.fetchNew<T>(r))
      .catch((e) => this.raiseTextError<MongoDoc<T>>(e));
  }

  update<T>(collection: string, doc: MongoDoc<T>): Observable<MongoDoc<T>> {
    const path = `${collection}/${doc._id.$oid}?checkEtag`;
    const bodyObj = {
      "$set": {"current": doc.current},
      "$push": {"prev": doc.current},
    };

    const url = new URL(this.baseUrl.href);
    url.pathname += path;

    return this.http.patch(url.href, JSON.stringify(bodyObj), this.getRequestOptions(doc.etag))
      .map((r) => <MongoDoc<T>>r.json())
      .catch((e) => this.raiseTextError<MongoDoc<T>>(e));
  }
}

