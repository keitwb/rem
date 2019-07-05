import { ObjectId } from "bson";
import { Action, Dispatch, Middleware } from "redux";
import { ActionType, getType } from "typesafe-actions";

import { DataClient } from "@/backend/data";
import { AppState } from "@/store";
import * as dbActions from "@/store/db/actions";

export function ensureModelPresent(dispatch: Dispatch) {
  return (collection: string, ids: ObjectId[]) => dispatch(dbActions.fetch(collection, ids));
}

export function createFetchMiddleware(dataClient: DataClient): Middleware<{}, AppState> {
  return ({ dispatch, getState }) => (next: Dispatch<Action>) => (action: ActionType<typeof dbActions>) => {
    if (getType(dbActions.fetch) === action.type) {
      const { collection, ids, force } = action.payload;

      const idsToFetch: ObjectId[] = [];
      for (const id of ids) {
        // Don't fetch if the doc is already in the store since the change stream ought to keep it up
        // to date.
        if (force || !(id.toString() in getState().db[collection].docs)) {
          idsToFetch.push(id);
        }
      }

      if (idsToFetch.length === 0) {
        return;
      }

      return (async function doUpdate() {
        try {
          const docs = await dataClient.getMany(collection, idsToFetch);
          for (const doc of docs) {
            dispatch(dbActions.loadOne(collection, doc));
          }
        } catch (err) {
          dispatch(dbActions.fetchFailed(collection, idsToFetch, err));
        }
      })();
    }
    return next(action);
  };
}
