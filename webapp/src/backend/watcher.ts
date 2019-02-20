import { ObjectId } from "bson";
import * as EJSON from "mongodb-extended-json";

import { MongoDoc } from "@/model/models.gen";
import { logger } from "@/util/log";
import WebSocketProvider from "./websocket/provider";
import RobustWebSocket from "./websocket/robust";
import streamWebSocket from "./websocket/stream";

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

interface ChangeResp {
  doc: ChangeDocTypes;
  hasMore: boolean;
  reqID: string;
  error?: string;
}

interface ChangeDoc {
  // The id of the change itself.  Can be used to resume the change stream.
  _id: any;
  documentKey: { _id: ObjectId };
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
type ReplaceChangeDoc = NonDeleteChangeDoc;

export function isUpdate(change: ChangeDoc): change is UpdateChangeDoc {
  return change.operationType === "update";
}

export function isReplace(change: ChangeDoc): change is ReplaceChangeDoc {
  return change.operationType === "replace";
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

type ChangeDocTypes = UpdateChangeDoc | ReplaceChangeDoc | InsertChangeDoc | DeleteChangeDoc;

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
  changeStreamerURL: string
): Promise<[AsyncIterableIterator<ChangeDocTypes>, Canceller]> {
  const provider = new RobustWebSocket(changeStreamerURL);
  const resumeContext = new ResumeContext();

  initStreamer(collection, provider, resumeContext);

  const streamer = await createStreamer(provider, resumeContext);

  return [streamer, provider.stop];
}

async function initStreamer(collection: string, provider: WebSocketProvider, resumeContext: ResumeContext) {
  provider.ws
    .then(async ws => {
      ws.send(
        JSON.stringify({
          collection,
          resumeAfter: resumeContext.get(),
        })
      );
    })
    .catch(err => {
      logger.error("Could not establish watcher connection", err);
    });

  provider.closePromise.then(_ => {
    initStreamer(collection, provider, resumeContext);
  });
}

async function* createStreamer(
  provider: WebSocketProvider,
  resumeContext: ResumeContext
): AsyncIterableIterator<ChangeDocTypes> {
  const streamer = streamWebSocket(provider);

  for await (const msg of streamer) {
    let resp: ChangeResp | ErrorResponse;
    try {
      resp = EJSON.parse(msg.data);
    } catch (e) {
      logger.error("Could not parse websocket message: ", e);
      continue;
    }

    if (isError(resp)) {
      logger.error(`Received error from update stream: ${resp.error}`);
      continue;
    }

    const doc = resp.doc;
    // Maybe do something better with start messages.
    if (isStarted(resp)) {
      continue;
    }

    yield doc;

    resumeContext.set(doc._id);
  }
}
