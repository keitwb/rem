import { Action }    from '@ngrx/store';
import { Md5 }       from 'ts-md5/dist/md5';

import { SortOrder, MongoDoc, ETag, MongoID } from "app/services/mongo";
import { ModelUpdate }                        from "app/util/updates";

export const REQUEST_ONE          = '[db] Request One';
export const REQUEST_ONE_SUCCESS  = '[db] Request One Success';
export const REQUEST_MANY_SUCCESS = '[db] Request Many Success';
export const REQUEST_FAILURE      = '[db] Request Failed';
export const CREATE               = '[db] Create';
export const CREATE_SUCCESS       = '[db] Create Success';
export const CREATE_FAILURE       = '[db] Create Failure';
export const UPDATE               = '[db] Update';
export const UPDATE_SUCCESS       = '[db] Update Success';
export const UPDATE_FAILURE       = '[db] Update Failure';
export const LOAD                 = '[db] Load';
export const DELETE               = '[db] Delete';


export class RequestManySuccessAction implements Action {
  readonly type = REQUEST_MANY_SUCCESS;

  constructor(public payload: {collection: string, docs: MongoDoc[]}) { }
}

export class RequestOneAction implements Action {
  readonly type = REQUEST_ONE;

  get queryId(): string { return this.payload.id.$oid; }
  constructor(public payload: {collection: string, id: MongoID}) { }
}

export class RequestOneSuccessAction implements Action {
  readonly type = REQUEST_ONE_SUCCESS;

  get queryId() { return this.payload.doc._id.$oid; }
  constructor(public payload: {collection: string, doc: MongoDoc}) { }
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

  constructor(public payload: {collection: string, createId: string}) { }
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

  constructor(public payload: {collection: string, doc: MongoDoc}) { }
}

export class UpdateFailureAction implements Action {
  readonly type = UPDATE_FAILURE;

  constructor(public payload: {error: string, collection: string, id: MongoID}) { }
}

export class LoadAction implements Action {
  readonly type = LOAD;

  constructor(public payload: {collection: string, doc: MongoDoc}) { }
}

export class DeleteAction implements Action {
  readonly type = DELETE;

  constructor(public payload: {collection: string, id: MongoID}) { }
}

export type Actions = RequestOneAction | RequestManySuccessAction |
  RequestOneSuccessAction | RequestFailureAction | CreateAction |
  CreateSuccessAction | CreateFailureAction | UpdateAction |
  UpdateSuccessAction | UpdateFailureAction | LoadAction | DeleteAction;
