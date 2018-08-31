// tslint:disable:max-classes-per-file
import { Action } from "redux";

import { MongoDoc, MongoID } from "@/model/models";

export const LOAD = "[db] Load";
export const DELETE = "[db] Delete";

export class LoadAction implements Action {
  public readonly type = LOAD;

  constructor(public payload: { collection: string; doc: MongoDoc }) {}
}

export class DeleteAction implements Action {
  public readonly type = DELETE;

  constructor(public payload: { collection: string; id: MongoID }) {}
}

export type Actions = LoadAction | DeleteAction;
