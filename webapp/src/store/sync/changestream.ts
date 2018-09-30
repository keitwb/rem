import { Action, Dispatch } from "redux";

import { isDelete, isInsert, isReplace, isUpdate, watchCollection } from "@/backend/watcher";
import Config from "@/config/config";

import * as dbActions from "@/store/db/actions";
import { logger } from "@/util/log";

const COLLECTIONS_TO_SYNC = ["properties", "media.files"];

/**
 * Launches long-running async loops that watch all of the app collections for changes and keeps our
 * local store up to date with them.
 */
export function syncBackendChangesToStore(dispatch: Dispatch<Action>) {
  const conf = Config.fromLocalStorage();
  for (const collection of COLLECTIONS_TO_SYNC) {
    syncCollectionToStore(dispatch, collection, conf.changeStreamURL);
  }
}

/**
 * Consume change documents from a change stream for the given collection and update the redux store
 * accordingly.
 */
async function syncCollectionToStore(dispatch: Dispatch<Action>, collection: string, changeStreamURL: string) {
  const [streamer] = await watchCollection(collection, changeStreamURL);
  for await (const change of streamer) {
    if (isInsert(change) || isUpdate(change) || isReplace(change)) {
      dispatch(dbActions.loadOne(collection, change.fullDocument));
    } else if (isDelete(change)) {
      dispatch(dbActions.deleteOne(collection, change.documentKey._id));
    } else {
      logger.warning(`Unknown change event seen: `, change);
    }
  }
}
