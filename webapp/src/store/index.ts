import { createStore, Store } from "redux";
import { AppState, reducers } from "./reducers";

export type AppStore = Store<AppState>;

export function initStore(): Store<AppState> {
  return createStore(reducers);
}
