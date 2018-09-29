import { ObjectId } from "bson";
import { Action, Dispatch, Middleware } from "redux";
import { ActionType, getType } from "typesafe-actions";

import { MongoClient } from "@/backend/mongo";
import { AppState } from "@/store";
import * as dbActions from "@/store/db/actions";

export function ensureModelPresent(dispatch: Dispatch) {
  return (collection: string, id: ObjectId) => dispatch(dbActions.fetchOne(collection, id));
}

export function createFetchMiddleware(mongoClient: MongoClient): Middleware<{}, AppState> {
  return ({ dispatch }) => (next: Dispatch<Action>) => (action: ActionType<typeof dbActions>) => {
    if (getType(dbActions.fetchOne) === action.type) {
      return (async function doUpdate() {
        const { collection, id } = action.payload;
        try {
          const doc = await mongoClient.getOne(collection, id);
          dispatch(dbActions.loadOne(collection, doc));
        } catch (err) {
          dispatch(dbActions.fetchFailed(collection, id, err));
          throw err;
        }
      })();
    } else {
      return next(action);
    }
  };
}
