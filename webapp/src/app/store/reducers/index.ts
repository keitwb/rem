import { combineReducers, Action } from '@ngrx/store';
import * as db from './db';

export interface AppState {
  db: db.State;
}

export function reducer(s: AppState, a: Action) {
  return combineReducers({
    db: db.reducer,
  });
}
