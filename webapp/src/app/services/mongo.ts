import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { of }         from 'rxjs/observable/of';
import { Store }      from '@ngrx/store';
import * as _         from 'lodash';


type Model = { id: string };
type ModelState = { [index:string]: string | number | boolean | Date };

interface MongoDoc<T extends ModelState> {
  _id:         { $oid: string };
  _collection: string;
  etag:        string;
  createdDate: Date;
  current:     T;
  prev:        T[],
}

type SortOrdering = "asc" | "desc"

@Injectable
class MongoVersioningClient {
  constructor(private http: Http, private baseUrl: URL) {
    // Make sure the base url path ends in "/"
    if (!this.baseUrl.pathName.endsWith("/")) {
      this.baseUrl.pathName += "/";
    }
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

  private extractJson<T>(coll: string, res: Response): MongoDoc<T> | MongoDoc<T>[] {
    const objOrArr = res.json();
    const addCollName = (o) => { Object.assign({}, o, {_collection: coll}) };

    if (_.isArray(objOrArr)) {
      return _.map(objOrArr, this.addCollName);
    }
    else {
      return this.addCollName(objOrArr);
    }
  }

  private raiseTextError(res: Response): never {
    try {
      const data = res.json();
      if (data && data.message) throw data.message;
    } catch(e) {
      throw res.text() || "Unknown Error";
    }
  }

  // Since RESTHeart doesn't return the new doc upon creation, go fetch it
  // based on the Location header returned.
  private fetchNew<T>(res: Response): Observable<MongoDoc<T>> {
    let id string;
    if (res.status != 201) {
      throw `Document was not created: ${res.toString()}`;
    }

    const url = new URL(res.headers.get("Location"));
    const [id, collection] = url.pathName.split("/").reverse();
    return get_one(id, collection);
  }

  get_list<T>(collection: string, params: {page: number, count: number, sort_by: string, order: SortOrdering}): Observable<MongoDoc<T>> {
    const ordering_flag = order == "asc" ? "" : "-1";
    const url = new URL(this.baseUrl);
    url.pathName += collection;
    url.searchParams = new URLSearchParams(Object.entries({
      page: params.page,
      pagesize: params.count,
      sort_by: ordering_flag + params.sort_by,
    }));

    return this.http.get(url.href).flatMap(_.partial(this.extractJson, collection));
  }

  get_one<T>(id: string, collection: string): Observable<MongoDoc<T>> {
    const url = new URL(this.baseUrl);
    url.pathName += `${collection}/${id}`;
    return this.http.get(url.href).map(_.partial(this.extractJson, collection));
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

    const url = new URL(this.baseUrl);
    url.pathName += path;
    return this.http.post(url.href, JSON.stringify(bodyObj), this.getRequestOptions())
      .switchMap(this.fetchNew<T>)
      .catch(this.raiseTextError);
  }

  update<T>(newModel: T, doc: MongoDoc<T>): Observable<MongoDoc<T>> {
    const path = `${doc._collection}/${doc._id.$oid}?checkEtag`;
    const bodyObj = {
      "$set": {"current": newModel},
      "$push": {"prev": doc.current},
    };

    const url = new URL(this.baseUrl);
    url.pathName += path;

    return this.http.patch(url.href, JSON.stringify(body), this.getRequestOptions(doc.etag))
      .map(_.partial(this.extractJson<T>, doc._collection))
      .catch(this.raiseTextError);
  }
}

