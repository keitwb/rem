import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/switchMap';
import { Observable }                              from 'rxjs/Observable';
import * as _                                      from 'lodash';
import { ObjectID } from 'bson';

import {ModelUpdate} from 'util/updates';
import * as config from '@/config';
import * as http from '@/util/http';

export type MongoID = { $oid: string };
export type MongoDate = { $date: number };
export type SortOrder = 'asc' | 'desc';

export interface MongoDoc {
  _id:          MongoID;
  _links:       { [id:string]: { href: string } };
  _etag:        MongoID;
  _createdDate: { $date: number };
  _updates:     MongoUpdate[];
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

interface Rel {
  refField:   string;
  targetColl: string;
  role:       string;
  'type':     string;
}

// tslint:disable-next-line
interface CollectionRels {
  [index: string /* Collection name */]: {[index: string /* relation name */]: Rel};
}

export type ETag = {$oid: string};

const baseUrl = new URL(config.dbURL);

// Make sure the base url path ends in "/" for easier processing later
if (!baseUrl.pathname.endsWith('/')) {
  baseUrl.pathname += '/';
}

function getHeaders(etag: ETag = null): Headers {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });
  if (etag) {
    headers.set('If-Match', etag.$oid);
  }
  return headers;
}

function getUrl(path: string): URL {
  const url = new URL(baseUrl.href);
  url.pathname += path;
  return url;
}

// Since RESTHeart doesn't return the new doc upon creation, go fetch it
// based on the Location header returned.
function fetchNew<T extends MongoDoc>(res: http.Response<T>): Observable<T> {
  if (res.status != 201) {
    return Observable.throw(`Document was not created: ${res.toString()}`);
  }

  const url = new URL(res.headers.get('Location'));
  const [id, collection] = url.pathname.split('/').reverse();
  return getOne(collection, {$oid: id});
}

// tslint:disable-next-line
function fetchRelated<T extends MongoDoc, R extends MongoDoc>(doc: T, relName: string): Observable<R[]> {
  if (!doc._links[relName] || !doc._links[relName].href) {
    return Observable.of([]);
  }

  const rel = doc._links[relName];
  return http.get<R[]>(rel.href)
    .map(r => r.json)
}

export function getAggregation<T>(collection: string, name: string, params: object): Observable<T> {
  const url = getUrl(`${collection}/_aggrs/${name}`);
  url.searchParams.set('avars', JSON.stringify(params));
  url.searchParams.set('np', '');
  return streamDocs(url);
}

export function streamDocs<T>(url: URL): Observable<T> {
  function fetchLazily({page, pageSize}: {page: number, pageSize: number}): Observable<T> {
    return Observable.defer(() => {
      const page$ = getPage<T>(url, {page, pageSize});

      return page$.mergeMap(resp => {
        if (!resp.length) {
          return Observable.empty<T>();
        }

        const doc$: Observable<T> = Observable.from(resp);
        const nextPage = page + 1;
        const next$ = fetchLazily({page: nextPage, pageSize});

        return Observable.concat(doc$, next$);
      });
    });
  };

  return fetchLazily({page: 1, pageSize: 1});
}

function urlForPage(url: URL, {page, pageSize}: {page: number, pageSize: number}): URL {
  const pageUrl = new URL(url.href);

  pageUrl.searchParams.set('page', String(page));
  pageUrl.searchParams.set('pagesize', String(pageSize));
  return pageUrl;
}

function makeListURL(collection: string,
    params: {page?: number,
             pageSize?: number,
             filter: object,
             sortBy: string,
             sortOrder: SortOrder}): URL {
  const ordering_flag = params.sortOrder == 'asc' ? '' : '-';
  const url = getUrl(collection);

  url.searchParams.set('np', '');
  if (params.sortBy) url.searchParams.set('sort_by', `${ordering_flag}${params.sortBy}`);
  if (params.filter) url.searchParams.set('filter', JSON.stringify(params.filter));
  if (params.pageSize) url.searchParams.set('pagesize', String(params.pageSize));
  if (params.page) url.searchParams.set('page', String(params.page));

  return url;
}

export function streamCollection<T extends MongoDoc>(collection: string,
    params: {filter: object, sortBy: string, sortOrder: SortOrder}): Observable<T> {
  return streamDocs<T>(makeListURL(collection, params));
}

export function getCollectionPage<T extends MongoDoc>(collection: string,
    params: {page?: number,
             pageSize?: number,
             filter: object,
             sortBy: string,
             sortOrder: SortOrder}): Observable<T[]> {
  return http.get<T[]>(makeListURL(collection, params).href).map(r => r.json);
}

export function getPage<T>(url: URL, params: {page: number, pageSize: number}): Observable<T[]> {
  const pageUrl = urlForPage(url, params);
  return http.get<T[]>(pageUrl.href)
    .map(r => r.json);
}

// Simply grabs all of the pages of a query and concatenates all of the
// embedded docs into a single list that is emitted from the returned
// Observable.  Useful if you know the list is small.
export function getFullList<T extends MongoDoc>(collection: string,
    {filter, sortBy, sortOrder}: {
      filter?: object, sortBy?: string, sortOrder?: SortOrder}): Observable<T[]> {
  const url = makeListURL(collection, {filter, sortBy, sortOrder});

  function fetchNextPages({page, pageSize}: {page: number, pageSize: number}): Observable<T[]> {
    const page$ = getPage(url, {page, pageSize});

    return page$.mergeMap(resp => {
      if (!resp.length) {
        return Observable.empty<T[]>();
      }

      const nextPage = page + 1;
      const next$ = fetchNextPages({page: nextPage, pageSize});
      return Observable.concat(Observable.of<T[]>(<T[]>resp), next$);
    });
  }

  return fetchNextPages({page: 1, pageSize: 1}).reduce((acc, docs) => acc.concat(docs), []);
}

export function getOne<T extends MongoDoc>(collection: string, id: MongoID): Observable<T> {
  const url = getUrl(`${collection}/${id.$oid}`);
  return http.get<T>(url.href).map(r => r.json);
}

export function create<T extends MongoDoc>(collection: string, obj: T): Observable<MongoID> {
  const path = `${collection}`;
  const newId = {$oid: new ObjectID().toHexString()};
  const bodyObj = {
                    $set: _.merge({},
                      obj,
                      {
                        _id: newId,
                        _createdDate: (new Date()).toJSON(),
                        _updates: [],
                      }
                    ),
                  };

  const url = getUrl(path);

  return http.post(url.href, JSON.stringify(bodyObj), getHeaders())
    .mapTo(newId);
}

export function createFile<T extends MongoDoc>(collection: string, file: File, metadata: object): Observable<T> {
  const url = getUrl(collection);
  const fd = new FormData();
  fd.append('properties', JSON.stringify(metadata));
  fd.append('file', file);
  const headers = new Headers({
    'Content-Type': 'multipart/form',
    'Accept': 'application/json',
  });
  return http.post<T>(url.href, fd, headers)
    .switchMap(r => fetchNew<T>(r))
}

export function update<T extends MongoDoc>(collection: string, id: MongoID, etag: ETag, updates: ModelUpdate[]): Observable<T> {
  const path = `${collection}/${id.$oid}`;
  const bodyObj = _.merge({}, ..._.map(updates, u => u.updateObj));

  const url = getUrl(path);
  url.search = 'checkEtag';

  return http.patch(url.href, JSON.stringify(bodyObj), getHeaders(etag))
    .switchMap((r) => getOne<T>(collection, id))
}

