import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import { Observable }                              from 'rxjs/Observable';
import { Subject }                              from 'rxjs/Subject';
import { Injectable, Inject }                              from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import * as _                                      from 'lodash';

import {SortOrder}                                 from '.';
import {ModelUpdate} from 'app/util/updates';
import {APP_CONFIG, AppConfig}                                 from 'app/config';

export type MongoID = { $oid: string };
export type MongoDate = { $date: number };

export interface MongoDoc {
  _id:          MongoID;
  _links:       { [id:string]: { href: string } };
  _etag:        MongoID;
  _createdDate: { $date: number };
  _updates:     MongoUpdate[],
}

export interface GridFSDoc {
  md5: string;
  length: number;
  chunkSize: number;
  filename: string;
  contentType: string;
  uploadDate:    MongoDate;
}

interface MongoUpdate {
  'type': string;
  update: object;
}

export interface ListResult<T> {
  _embedded:   T[];
  _returned:   number;
  _size:       number;
  _total_pages: number;
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

  constructor(private http: Http, @Inject(APP_CONFIG) private config: AppConfig) {
    this.baseUrl = new URL(config.dbURL);

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

  // Since RESTHeart doesn't return the new doc upon creation, go fetch it
  // based on the Location header returned.
  private fetchNew<T extends MongoDoc>(res: Response): Observable<T> {
    if (res.status != 201) {
      throw `Document was not created: ${res.toString()}`;
    }

    const url = new URL(res.headers.get("Location"));
    const [id, collection] = url.pathname.split("/").reverse();
    return this.getOne(collection, {$oid: id});
  }

  fetchRelated<T extends MongoDoc, R extends MongoDoc>(doc: T, relName: string): Observable<R[]> {
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

  getPage<T>(url: URL, {page, pageSize}: {page: number, pageSize: number}): Observable<ListResult<T>> {
    const pageUrl = this.urlForPage(url, {page, pageSize});
    return this.http.get(pageUrl.href)
      .map(r => r.json());
  }

  streamEmbeddedDocs<T>(url: URL): [Observable<number>, Observable<T>] {
    const self = this;
    const sizeObs = new Subject<number>();

    function fetchLazily({page, pageSize}: {page: number, pageSize: number}): Observable<T> {
      return Observable.defer(() => {
        const page$ = self.getPage<T>(url, {page, pageSize});

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

    return [sizeObs, fetchLazily({page: 1, pageSize: 1})];
  }

  private urlForPage(url: URL, {page, pageSize}: {page: number, pageSize: number}): URL {
    const pageUrl = new URL(url.href);

    pageUrl.searchParams.set("page", String(page));
    pageUrl.searchParams.set("pagesize", String(pageSize));
    return pageUrl;
  }


  private makeListURL(collection: string, params: {filter?: object, sortBy?: string, sortOrder?: SortOrder}): URL {
    const ordering_flag = params.sortOrder == "asc" ? "" : "-";
    const url = this.getUrl(collection);

    // This makes it return pagination stats
    url.searchParams.set("count", "");

    if (params.sortBy) url.searchParams.set("sort_by", `${ordering_flag}${params.sortBy}`);
    if (params.filter) url.searchParams.set("filter", JSON.stringify(params.filter));

    return url;
  }

  streamList<T extends MongoDoc>(collection: string, params: {filter?: object, sortBy?: string, sortOrder?: SortOrder}): [Observable<number>, Observable<T>] {
    return this.streamEmbeddedDocs<T>(this.makeListURL(collection, params));
  }

  // Simply grabs all of the pages of a query and concatenates all of the
  // embedded docs into a single list that is emitted from the returned
  // Observable.  Useful if you know the list is small.
  getList<T extends MongoDoc>(collection: string, params: {filter?: object, sortBy?: string, sortOrder?: SortOrder}): Observable<T[]> {
    const url = this.makeListURL(collection, params);
    const self = this;

    function fetchNextPages({page, pageSize}: {page: number, pageSize: number}): Observable<T[]> {
      const page$ = self.getPage(url, {page, pageSize});

      return page$.mergeMap(resp => {
        const nextPage = page + 1;
        const hasMorePages = resp._total_pages >= nextPage;
        const next$ = hasMorePages
          ? fetchNextPages({page: nextPage, pageSize})
          : Observable.empty<T>()
        return Observable.concat(Observable.of<T[]>(<T[]>resp._embedded), next$);
      });
    }

    return fetchNextPages({page: 1, pageSize: 1}).reduce((acc, docs) => acc.concat(docs), []);
  }

  getOne<T extends MongoDoc>(collection: string, id: MongoID): Observable<T> {
    const url = this.getUrl(`${collection}/${id.$oid}`);
    return this.http.get(url.href).map(r => r.json());
  }

  create<T extends MongoDoc>(collection: string, obj: T): Observable<T> {
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

    return this.http.post(url.href, JSON.stringify(bodyObj), this.getRequestOptions())
      .switchMap(r => this.fetchNew<T>(r))
  }

  createFile<T extends MongoDoc>(collection: string, file: File, metadata: object): Observable<T> {
    const url = this.getUrl(collection);
    const fd = new FormData();
    fd.append("properties", JSON.stringify(metadata));
    fd.append("file", file);
    const headers = new Headers({
      'Content-Type': 'multipart/form',
      'Accept': 'application/json',
    });
    return this.http.post(url.href, fd, new RequestOptions({headers}))
      .switchMap(r => this.fetchNew<T>(r))
  }

  update<T extends MongoDoc>(collection: string, id: MongoID, etag: ETag, updates: ModelUpdate[]): Observable<T> {
    const path = `${collection}/${id.$oid}`;
    const bodyObj = _.merge({}, ..._.map(updates, u => u.updateObj));

    const url = this.getUrl(path);
    url.search = "checkEtag";

    return this.http.patch(url.href, JSON.stringify(bodyObj), this.getRequestOptions(etag))
      .switchMap((r) => this.getOne<T>(collection, id))
  }
}

