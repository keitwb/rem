import {Store} from 'vuex';
import {DBState, dbModule} from './db';

export interface AppState {
  db: DBState;
}

export function newStore(): Store<AppState> {
  return new Store({
    modules: {
      db: dbModule,
    },
  })
}
