import * as models from "@/model/models";
import { MongoDoc } from "@/model/models";
import * as dbActions from "@/store/actions/db";

export interface QueryResult {
  docIds: string[];
  returned: number;
  size: number;
  totalPages: number;
  inProgress: boolean;
  fetchError: string;
}

export interface MongoDocs<T extends MongoDoc> {
  [id: string]: T;
}

export interface ModelState<T extends MongoDoc> {
  docs: MongoDocs<T>;
  queryResults: { [queryId: string]: QueryResult };
  updateResults: { [id: string]: PersistResult };
  createResults: { [createId: string]: CreateResult };
}

export interface State {
  users: ModelState<models.User>;
  properties: ModelState<models.Property>;
  leases: ModelState<models.Lease>;
  notes: ModelState<models.Note>;
  parties: ModelState<models.Party>;
  media: ModelState<models.Media>;
}

export interface PersistResult {
  inProgress: boolean;
  error: string;
}

export interface CreateResult extends PersistResult {
  docId: string;
}

const defaultModelState = { docs: {}, queryResults: {}, updateResults: {}, createResults: {} };

export const initialState: State = {
  leases: defaultModelState,
  media: defaultModelState,
  notes: defaultModelState,
  parties: defaultModelState,
  properties: defaultModelState,
  users: defaultModelState,
};

export function reducer(state: State, action: dbActions.Actions): State {
  const { collection = null } = action.payload || {};
  switch (action.type) {
    case dbActions.LOAD:
      const doc = action.payload.doc;
      return {
        ...state,
        ...{
          [collection]: {
            ...state[collection],
            docs: { ...state[collection].docs, [doc._id.$oid]: doc },
          },
        },
      };

    case dbActions.DELETE:
      const id = action.payload.id;
      const { [id.$oid]: _, ...newDocs } = state[collection].docs;
      return {
        ...state,
        ...{
          [collection]: {
            ...state[collection],
            docs: newDocs,
          },
        },
      };

    default:
      return state;
  }
}
