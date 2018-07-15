import delay from "lodash-es/delay";

import { MongoDoc, MongoID } from "./mongo";

import * as config from "@/config";
import { log } from "@/util/log";

const RECONNECT_DELAY_MS = 2000;

type OperationType = "update" | "insert" | "delete" | "replace";

// A response sent by the update streamer when the watch has been fully started.
interface StartedResponse {
  started: boolean;
}

// A response sent by the update streamer when there is an error
interface ErrorResponse {
  error: string;
}

interface ChangeDoc {
  // The id of the change itself.  Can be used to resume the change stream.
  _id: any;
  documentKey: { _id: MongoID };
  operationType: OperationType;
  ns: { coll: string; db: string };
}

interface NonDeleteChangeDoc extends ChangeDoc {
  fullDocument: MongoDoc;
}

interface UpdateChangeDoc extends NonDeleteChangeDoc {
  updateDescription: { updatedFields: object; removedFields: string[] };
}

type InsertChangeDoc = NonDeleteChangeDoc;
type DeleteChangeDoc = ChangeDoc;

function isUpdate(change: ChangeDoc): change is UpdateChangeDoc {
  return change.operationType === "update";
}

function isInsert(change: ChangeDoc): change is InsertChangeDoc {
  return change.operationType === "insert";
}

function isDelete(change: ChangeDoc): change is DeleteChangeDoc {
  return change.operationType === "delete";
}

function isStarted(change: any): change is StartedResponse {
  return !!change.started;
}

function isError(change: any): change is ErrorResponse {
  return !!change.error;
}

type ChangeDocTypes = UpdateChangeDoc | InsertChangeDoc | DeleteChangeDoc;

function watchCollection(collection: string, cb: (_: ChangeDocTypes) => void): Promise<null> {
  return new Promise<null>((resolve, reject) => createWebSocket(collection, null, cb, () => resolve(null)));
}

function createWebSocket(collection: string, resumeAfter: any, cb: (_: ChangeDocTypes) => void, started: () => void) {
  const ws = new WebSocket(config.updateStreamURL);

  ws.onclose = () => {
    log.warning(`Watch socket closed for ${collection} collection, resuming..`);
    delay(() => createWebSocket(collection, resumeAfter, cb, started), RECONNECT_DELAY_MS);
  };

  ws.onerror = e => {
    log.error(`Error with websocket: ${e}`);
  };

  ws.onmessage = msg => {
    let data: ChangeDocTypes | ErrorResponse;
    try {
      data = JSON.parse(msg.data);
    } catch (e) {
      log.error(`Could not parse websocket message: ${e}`);
      return;
    }

    if (isStarted(data)) {
      started();
    }

    if (isError(data)) {
      log.error(`Received error from update stream: ${data.error}`);
      return;
    }

    cb(data);

    resumeAfter = data._id;
  };

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        collection,
        resumeAfter,
      })
    );
  };
}
