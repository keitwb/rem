import { Action }    from '@ngrx/store';
import { Md5 }       from 'ts-md5/dist/md5';

import { SortOrder } from 'app/services';
import { MongoDoc, ETag, MongoID }  from "app/services/mongo";
import { ModelUpdate }  from "app/services/updates";

export const REQUEST_ONE = '[Mongo] Request One';
export const REQUEST_MANY = '[Mongo] Request Many';
export const REQUEST_SUCCESS = '[Mongo] Request Success';
export const REQUEST_ONE_SUCCESS = '[Mongo] Request One Success';
export const REQUEST_MANY_SUCCESS = '[Mongo] Request Many Success';
export const REQUEST_FAILURE = '[Mongo] Request Failed';
export const CREATE = '[Mongo] Create';
export const CREATE_SUCCESS = '[Mongo] Create Success';
export const CREATE_FAILURE = '[Mongo] Create Failure';
export const UPDATE = '[Mongo] Update';
export const UPDATE_SUCCESS = '[Mongo] Update Success';
export const UPDATE_FAILURE = '[Mongo] Update Failure';

export interface RequestManyPayload {
  collection: string;
  filter:    object;
  page:      number;
  pageSize:  number;
  sortBy:    string;
  sortOrder: SortOrder;
  queryId?:  string;
}

interface RequestManySuccessPayload extends RequestManyPayload {
  docs:       MongoDoc<any>[];
  // The total number of docs across all pages
  size:       number;
  totalPages: number;
}

export class RequestManyAction implements Action {
  readonly type = REQUEST_MANY;

  get queryId(): string {
    const s = JSON.stringify([this.payload.collection, this.payload.filter,
      this.payload.page, this.payload.pageSize, this.payload.sortBy,
      this.payload.sortOrder]);
    return <string>Md5.hashStr(s);
  }

  constructor(public payload: RequestManyPayload) { }
}

export class RequestManySuccessAction implements Action {
  readonly type = REQUEST_MANY_SUCCESS;

  get queryId() { return this.payload.queryId; }
  constructor(public payload: RequestManySuccessPayload) { }
}

export class RequestOneAction implements Action {
  readonly type = REQUEST_ONE;

  get queryId(): string { return this.payload.id.$oid; }
  constructor(public payload: {collection: string, id: MongoID}) { }
}

export class RequestOneSuccessAction implements Action {
  readonly type = REQUEST_ONE_SUCCESS;

  get queryId() { return this.payload.doc._id.$oid; }
  constructor(public payload: {collection: string, doc: MongoDoc<any>}) { }
}

export class RequestFailureAction implements Action {
  readonly type = REQUEST_FAILURE;

  get queryId() { return this.payload.queryId; }
  constructor(public payload: {error: string, queryId: string, collection: string}) { }
}

export class CreateAction implements Action {
  readonly type = CREATE;

  constructor(public payload: {collection: string, createId: string, model: any}) { }
}

export class CreateSuccessAction implements Action {
  readonly type = CREATE_SUCCESS;

  constructor(public payload: {collection: string, createId: string, doc: MongoDoc<any>}) { }
}

export class CreateFailureAction implements Action {
  readonly type = CREATE_FAILURE;

  constructor(public payload: {collection: string, createId: string, error: string}) { }
}

export class UpdateAction implements Action {
  readonly type = UPDATE;

  constructor(public payload: {collection: string, id: MongoID, etag: ETag, update: ModelUpdate}) { }
}

export class UpdateSuccessAction implements Action {
  readonly type = UPDATE_SUCCESS;

  constructor(public payload: {collection: string, doc: MongoDoc<any>}) { }
}

export class UpdateFailureAction implements Action {
  readonly type = UPDATE_FAILURE;

  constructor(public payload: {error: string, collection: string, id: MongoID}) { }
}

export type Actions = RequestManyAction | RequestOneAction |
  RequestManySuccessAction | RequestOneSuccessAction | RequestFailureAction |
  CreateAction | CreateSuccessAction | CreateFailureAction |
  UpdateAction | UpdateSuccessAction | UpdateFailureAction;
