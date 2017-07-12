import { Action }    from '@ngrx/store';

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
  filter?:    string;
  page?:      number;
  count?:     number;
  sort_by?:   string;
  order?:     SortOrder;
}

interface RequestManySuccessPayload extends RequestManyPayload {
  docs:        MongoDoc<any>[];
  returned?:   number;
  size?:       number;
  totalPages?: number;
}

export class RequestManyAction implements Action {
  readonly type = REQUEST_MANY;

  constructor(public payload: RequestManyPayload) {}
}

export class RequestOneAction implements Action {
  readonly type = REQUEST_ONE;

  constructor(public payload: {collection: string, id: string}) { }
}

export class RequestOneSuccessAction implements Action {
  readonly type = REQUEST_ONE_SUCCESS;

  constructor(public payload: {collection: string, doc: MongoDoc<any>}) { }
}

export class RequestManySuccessAction implements Action {
  readonly type = REQUEST_MANY_SUCCESS;

  constructor(public payload: RequestManySuccessPayload) { }
}

export class RequestFailureAction implements Action {
  readonly type = REQUEST_FAILURE;

  constructor(public payload: {error: string, collection: string}) { }
}

export type Actions = RequestManyAction | RequestOneAction | RequestManySuccessAction | RequestOneSuccessAction | RequestFailureAction;
