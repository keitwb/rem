import { ActionType, getType } from "typesafe-actions";

import * as dbActions from "./actions";
import { State } from "./state";

const defaultModelState = { docs: {}, queryResults: {}, updateResults: {}, createResults: {} };

export const initialState: State = {
  leases: defaultModelState,
  "media.files": defaultModelState,
  notes: defaultModelState,
  parties: defaultModelState,
  properties: defaultModelState,
  users: defaultModelState,
  insurancePolicies: defaultModelState,
};

export function reducer(state: State = initialState, action: ActionType<typeof dbActions>): State {
  const { collection = null } = action.payload || {};
  switch (action.type) {
    case getType(dbActions.loadOne):
      const doc = action.payload.doc;
      return {
        ...state,
        ...{
          [collection]: {
            ...state[collection],
            docs: { ...state[collection].docs, [doc._id.toHexString()]: doc },
          },
        },
      };

    case getType(dbActions.deleteOne):
      const { [action.payload.id.toHexString()]: _, ...newDocs } = state[collection].docs;
      return {
        ...state,
        ...{
          [collection]: {
            ...state[collection],
            docs: newDocs,
          },
        },
      };

    case getType(dbActions.fetchFailed):
      const docIds = action.payload.ids.map(i => i.toHexString());

      const docsToMerge = docIds.reduce(
        (obj, docId) => ({ ...obj, [docId]: { ...state[collection].docs[docId], _error: action.payload.err } }),
        {}
      );

      return {
        ...state,
        ...{
          [collection]: {
            ...state[collection],
            docs: {
              ...state[collection].docs,
              ...docsToMerge,
            },
          },
        },
      };
    default:
      return state;
  }
}
