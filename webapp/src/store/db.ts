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
}

const defaultModelState = {docs: {}};


type Collection = "users" | "properties" | "leases" | "notes" | "parties" | "media";


export const dbModule: Module<DBState, AppState> = {
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
    getDoc: (state: DBState) => (collection: Collection) => (id: string) => state[collection].docs[id],
  },

  mutations: {

  },
};

export const LOAD = "LOAD";
export const DELETE = "DELETE";

export const makeLoadCommit = payloadFactory<{collection: string, docs: MongoDoc[]}>(LOAD);
export const makeDeleteCommit = payloadFactory<{collection: string, id: MongoID}>(DELETE);

