import {Module} from 'vuex';
import {MongoDoc, MongoID} from '@/services/mongo';
import * as models from '@/models';
import {payloadFactory} from './util';
import {AppState} from '.';

export type MongoDocs<T extends MongoDoc> = {[id:string]: T};


export interface ModelState<T extends MongoDoc> {
  docs: MongoDocs<T>;
}

export interface DBState {
  users:            ModelState<models.User>;
  properties:       ModelState<models.Property>;
  leases:           ModelState<models.Lease>;
  notes:            ModelState<models.Note>;
  parties:          ModelState<models.Party>;
  media:            ModelState<models.Media>;
  // Hack to avoid implicit any error (see
  // https://stackoverflow.com/q/32968332/1009106).
  [key: string]: ModelState<any>;
}

const defaultModelState = {docs: {}};

type DBModule = Module<DBState, AppState>;

export const dbModule: DBModule = {
  namespaced: true,
  state: {
    users:            defaultModelState,
    properties:       defaultModelState,
    leases:           defaultModelState,
    notes:            defaultModelState,
    parties:          defaultModelState,
    media:            defaultModelState,
  },

  getters: {
    getUser: (state: DBState) => (id: string) => state.users.docs[id],
    getProperty: (state: DBState) => (id: string) => state.properties.docs[id],
    getLease: (state: DBState) => (id: string) => state.leases.docs[id],
    getNote: (state: DBState) => (id: string) => state.notes.docs[id],
    getParty: (state: DBState) => (id: string) => state.parties.docs[id],
    getMedia: (state: DBState) => (id: string) => state.media.docs[id],
  },

  mutations: {
    [LOAD](state, {collection, docs}: {collection: string, docs: MongoDoc[]}) {
      const newDocMap = docs.reduce((acc, o) => {
        return {...acc, [o._id.$oid]: o};
      }, {});
      state[collection].docs = {
        ...newDocMap,
        ...state[collection].docs,
      };
    },

    [DELETE](state, {collection, id}) {
      let {[id.$oid]: _, ...newDocs} = state[collection].docs;
      state[collection].docs = newDocs;
    },
  },
};

export const LOAD = 'LOAD';
export const DELETE = 'DELETE';

export const makeLoadCommit = payloadFactory<{collection: string, docs: MongoDoc[]}>(LOAD);
export const makeDeleteCommit = payloadFactory<{collection: string, id: MongoID}>(DELETE);

