/*
 * import { createSelector } from "reselect";
import { AppState } from "./reducers";
import * as db from "./reducers/db";

import { MongoDoc } from "@/model/models";

export const selectDB = (state: AppState) => state.db;

export const selectModelState = (collection: string) =>
  createSelector(selectDB, <T extends MongoDoc>(state: db.State) => state[collection] as db.ModelState<T>);

export const getModelDocs = (collection: string) =>
  createSelector(selectModelState(collection), <T extends MongoDoc>(ms: db.ModelState<T>) => ms.docs);

export const getDoc = (collection: string) =>
  createSelector(<T extends MongoDoc>(id: string) =>
    createSelector(getModelDocs(collection), (docs: db.MongoDocs<T>) => docs[id])
  );
*/
