import { MongoDoc, MongoID } from "@/model/models";

import Config from "@/config/config";
import { logger } from "@/util/log";
import sleep from "@/util/sleep";

const RECONNECT_DELAY_MS = 2000;

type OperationType = "update" | "insert" | "delete" | "replace";

type Canceller = () => void;

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

export function isUpdate(change: ChangeDoc): change is UpdateChangeDoc {
  return change.operationType === "update";
}

export function isInsert(change: ChangeDoc): change is InsertChangeDoc {
  return change.operationType === "insert";
}

export function isDelete(change: ChangeDoc): change is DeleteChangeDoc {
  return change.operationType === "delete";
}

function isStarted(change: any): change is StartedResponse {
  return !!change.started;
}

function isError(change: any): change is ErrorResponse {
  return !!change.error;
}

type ChangeDocTypes = UpdateChangeDoc | InsertChangeDoc | DeleteChangeDoc;

class ResumeContext {
  private resumeAfter: any;

  public set(val: any) {
    this.resumeAfter = val;
  }

  public get(): any {
    return this.resumeAfter;
  }
}

export async function watchCollection(
  collection: string,
  updateStreamerURL: string,
  cb: (_: ChangeDocTypes) => void
): Promise<Canceller> {
  const resumeContext = new ResumeContext();
  const config = Config.fromLocalStorage();
  let ws = await createWebSocket(collection, config.updateStreamerURL, resumeContext, cb);

  let cancelled = false;
  const canceller = () => {
    cancelled = true;
    ws.close(1000);
  };

  ws.onclose = async () => {
    logger.warning(`Change stream socket closed for ${collection} collection, resuming..`);
    if (!cancelled) {
      while (true) {
        sleep(RECONNECT_DELAY_MS);
        try {
          ws = await createWebSocket(collection, updateStreamerURL, resumeContext, cb);
          break;
        } catch (e) {
          logger.error(`Could not reconnect change stream websocket for collection ${collection}: ${e.toString()}`);
          continue;
        }
      }
    }
  };
  return canceller;
}

function createWebSocket(
  collection: string,
  updateStreamerURL: string,
  resumeContext: ResumeContext,
  cb: (_: ChangeDocTypes) => void
): Promise<WebSocket> {
  return new Promise<WebSocket>((resolve, reject) => {
    let started = false;
    const ws = new WebSocket(updateStreamerURL);

    ws.onerror = e => {
      logger.error(`Error with websocket: ${e}`);
      if (!started) {
        reject(e);
      }
    };

    ws.onmessage = msg => {
      let data: ChangeDocTypes | ErrorResponse;
      try {
        data = JSON.parse(msg.data);
      } catch (e) {
        logger.error(`Could not parse websocket message: ${e}`);
        if (!started) {
          reject(e);
        }
        return;
      }

      if (isStarted(data)) {
        started = true;
        resolve(ws);
      }

      if (isError(data)) {
        logger.error(`Received error from update stream: ${data.error}`);
        if (!started) {
          reject(data.error);
        }
        return;
      }

      cb(data);

      resumeContext.set(data._id);
    };

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          collection,
          resumeAfter: resumeContext.get(),
        })
      );
    };
  });
}
