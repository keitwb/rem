import { Observable }  from 'rxjs/Observable';
import { ReplaySubject }  from 'rxjs/ReplaySubject';
import delay from 'lodash-es/delay';
import {Store} from 'vuex';

import { MongoDoc, MongoID }               from '@/services/mongo';
import { Logger }              from '@/services/logger';
import { DBState, makeLoadCommit, makeDeleteCommit }            from './db';
import {AppState} from '.';


const RECONNECT_DELAY_MS = 2000;


type OperationType = "update" | "insert" | "delete" | "replace";

interface ChangeDoc {
  // The id of the change itself.  Can be used to resume the change stream.
  _id: any;
  documentKey: {_id: MongoID};
  operationType: OperationType;
  ns: {coll: string, db: string};
}

interface NonDeleteChangeDoc extends ChangeDoc {
  fullDocument: MongoDoc;
}

interface UpdateChangeDoc extends NonDeleteChangeDoc {
  updateDescription: {updatedFields: object, removedFields: string[]};
}

interface InsertChangeDoc extends NonDeleteChangeDoc {}
interface DeleteChangeDoc extends ChangeDoc {}

function isUpdate(change: ChangeDoc): change is UpdateChangeDoc {
  return change.operationType === "update";
}

function isInsert(change: ChangeDoc): change is InsertChangeDoc {
  return change.operationType === "insert";
}

function isDelete(change: ChangeDoc): change is DeleteChangeDoc {
  return change.operationType === "delete";
}

type ChangeDocTypes = UpdateChangeDoc | InsertChangeDoc | DeleteChangeDoc;

// Connects to the watch stream via WebSocket and updates the store
// accordingly.
export const makeWatcherPlugin = (collection: string) => (store: Store<AppState>) => {
  const changes$ = this.watchCollection(collection);
  changes$.subscribe((change: ChangeDocTypes) => { commitChange(store, change); });
}

function watchCollection(collection: string): Observable<ChangeDocTypes> {
  const changes$ = new ReplaySubject<ChangeDocTypes>();
  this.createWebSocket(collection, null, changes$);
  return changes$.share();
}

function createWebSocket(collection: string, resumeAfter: any,
    changes$: ReplaySubject<ChangeDocTypes>) {
  let ws = new WebSocket(this.config.updateStreamURL);

  ws.onclose = () => {
    this.log.warning(`Watch socket closed for ${collection} collection, resuming..`);
    delay(() => this.createWebSocket(collection, resumeAfter, changes$), RECONNECT_DELAY_MS);
  };

  ws.onerror = (e) => {
    this.log.error(`Error with websocket: ${e}`);
  };

  ws.onmessage = (msg) => {
    let data;
    try {
      data = JSON.parse(msg.data)
    } catch (e) {
      this.log.error(`Could not parse websocket message: ${e}`);
      return;
    }

    if (data.error) {
      this.log.error(`Received error from update stream: ${data.error}`);
      return;
    }

    resumeAfter = data._id;

    changes$.next(data);
  };

  ws.onopen = () => {
    ws.send(JSON.stringify({
      collection,
      resumeAfter,
    }));
  };
}

function commitChange(store: Store<AppState>, change: ChangeDocTypes) {
  if (isInsert(change) || isUpdate(change)) {
    store.commit(makeLoadCommit({
      collection: change.ns.coll,
      docs: [change.fullDocument],
    }));
  } else if (isDelete(change)) {
    store.commit(makeDeleteCommit({
      collection: change.ns.coll,
      id: change.documentKey._id
    }));
  } else {
    this.log.error(`Unknown change document received ${change}`);
    return;
  }
}
