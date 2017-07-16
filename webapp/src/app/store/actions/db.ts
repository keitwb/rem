import { Action }    from '@ngrx/store';
import { Md5 }       from 'ts-md5/dist/md5';

import { SortOrder } from 'app/services';
import { MongoDoc }  from "app/services/mongo";

export const REQUEST_ONE = '[Mongo] Request One';
export const REQUEST_MANY = '[Mongo] Request Many';
export const REQUEST_SUCCESS = '[Mongo] Request Success';
export const REQUEST_ONE_SUCCESS = '[Mongo] Request One Success';
export const REQUEST_MANY_SUCCESS = '[Mongo] Request Many Success';
export const REQUEST_FAILURE = '[Mongo] Request Failed';

interface RequestManyPayload {
  collection: string;
  filter:    string;
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

  get queryId() {
    const s = JSON.stringify([this.payload.collection, this.payload.filter,
      this.payload.page, this.payload.pageSize, this.payload.sortBy,
      this.payload.sortOrder]);
    return <string>Md5.hashStr(s);
  }

  constructor(public payload: RequestManyPayload) {
    this.payload = payload;
    this.payload.queryId = this.queryId;
  }
}

export class RequestManySuccessAction implements Action {
  readonly type = REQUEST_MANY_SUCCESS;

  constructor(public payload: RequestManySuccessPayload) { }
}

export class RequestOneAction implements Action {
  readonly type = REQUEST_ONE;

  constructor(public payload: {collection: string, id: string}) { }
}

export class RequestOneSuccessAction implements Action {
  readonly type = REQUEST_ONE_SUCCESS;

  constructor(public payload: {collection: string, doc: MongoDoc<any>}) { }
}

export class RequestFailureAction implements Action {
  readonly type = REQUEST_FAILURE;

  constructor(public payload: {error: string, collection: string}) { }
}

export type Actions = RequestManyAction | RequestOneAction | RequestManySuccessAction | RequestOneSuccessAction | RequestFailureAction;
