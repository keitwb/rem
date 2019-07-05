import { applyMiddleware, combineReducers, compose, createStore, Store } from "redux";

import { DataClient } from "@/backend/data";
import { createFetchMiddleware } from "./sync/fetch";
import { createUpdateMiddleware } from "./sync/updates";

import * as db from "./db";

export interface AppState {
  db: db.State;
}

const appReducers = combineReducers({
  db: db.reducer,
});

export type AppStore = Store<AppState>;

export function initStore(dataClient: DataClient): Store<AppState> {
  const updateMiddleware = createUpdateMiddleware(dataClient);
  const fetchMiddleware = createFetchMiddleware(dataClient);

  const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  return createStore(appReducers, composeEnhancers(applyMiddleware(fetchMiddleware, updateMiddleware)));
}
