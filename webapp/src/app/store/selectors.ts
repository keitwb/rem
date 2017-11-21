import { createSelector } from '@ngrx/store';
import { AppState } from './reducers';
import * as db from './reducers/db';
import { memoize as M } from 'ramda';

export const selectDB = (state: AppState) => state.db;

export const selectModelState = M((collection: string) =>
  createSelector(selectDB, <T>(state: db.State) => <db.ModelState<T>>state[collection]));

// Get the result of a query for many documents
export const getQueryResult = M((collection: string) => M((queryId: string) =>
  createSelector(selectModelState(collection), <T>(ms: db.ModelState<T>) => ms.queryResults[queryId])));

// Get the result of a creation action
export const getCreateResult = M((collection: string) => M((createId: string) =>
  createSelector(selectModelState(collection), <T>(ms: db.ModelState<T>) => ms.createResults[createId])));

export const getModelDocs = M((collection: string) =>
  createSelector(selectModelState(collection), <T>(ms: db.ModelState<T>) => ms.docs));

export const getDoc = M((collection: string) => M(<T>(id: string) =>
  createSelector(getModelDocs(collection), (docs: db.MongoDocs<T>) => docs[id])));

