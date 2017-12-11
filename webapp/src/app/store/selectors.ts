import { createSelector } from '@ngrx/store';
import { AppState } from './reducers';
import * as db from './reducers/db';
import { memoize as M } from 'ramda';

import { MongoDoc } from 'app/services/mongo';

export const selectDB = (state: AppState) => state.db;

export const selectModelState = M((collection: string) =>
  createSelector(selectDB, <T extends MongoDoc>(state: db.State) => <db.ModelState<T>>state[collection]));

// Get the result of a query for many documents
export const getQueryResult = M((collection: string) => M((queryId: string) =>
  createSelector(selectModelState(collection), <T extends MongoDoc>(ms: db.ModelState<T>) => ms.queryResults[queryId])));

// Get the result of a creation action
export const getCreateResult = M((collection: string) => M((createId: string) =>
  createSelector(selectModelState(collection), <T extends MongoDoc>(ms: db.ModelState<T>) => ms.createResults[createId])));

export const getModelDocs = M((collection: string) =>
  createSelector(selectModelState(collection), <T extends MongoDoc>(ms: db.ModelState<T>) => ms.docs));

export const getDoc = M((collection: string) => M(<T extends MongoDoc>(id: string) =>
  createSelector(getModelDocs(collection), (docs: db.MongoDocs<T>) => docs[id])));

