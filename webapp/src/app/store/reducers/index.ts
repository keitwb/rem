import { combineReducers, Action } from '@ngrx/store';
import * as db from './db';

export interface AppState {
  db: db.State;
}

export const reducers = {
  db: db.reducer,
};

export const initialState = {
  db: db.initialState,
};
