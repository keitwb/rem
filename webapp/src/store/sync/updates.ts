import { Action, Dispatch, Middleware } from "redux";
import { ActionType, getType } from "typesafe-actions";

import { DataClient } from "@/backend/data";
import { AppState } from "@/store";
import * as dbActions from "@/store/db/actions";

export function createUpdateMiddleware(dataClient: DataClient): Middleware<{}, AppState> {
  return ({ dispatch }) => (next: Dispatch<Action>) => (action: ActionType<typeof dbActions>) => {
    if (getType(dbActions.modifyOne) === action.type) {
      return (async function doUpdate() {
        const { collection, id, updates } = action.payload;
        try {
          await dataClient.update(collection, id, updates);
          // The results of the update will end up in the change stream and are not directly applied
          // to the store here.
        } catch (err) {
          dispatch(dbActions.modifyFailed(collection, id, updates, err));
        }
      })();
    } else {
      return next(action);
    }
  };
}
