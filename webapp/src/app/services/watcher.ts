import {Injectable, Inject } from '@angular/core';
import { Store }             from '@ngrx/store';
import { Observable }  from 'rxjs/Observable';
import { ReplaySubject }  from 'rxjs/ReplaySubject';
import * as _ from 'lodash';

import {AppConfig, APP_CONFIG} from 'app/config';
import { MongoDoc, MongoID }               from './mongo';
import { Logger }              from 'app/services/logger';
import { LoadAction, DeleteAction }            from 'app/store/actions/db';
import { AppState }            from 'app/store/reducers';


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
@Injectable()
export class WatcherService {
  constructor(@Inject(APP_CONFIG) private config: AppConfig,
              private log: Logger,
              private store: Store<AppState>) {}

  syncStoreFromChanges(collection: string) {
    const changes$ = this.watchCollection(collection);
    changes$.subscribe(
      (change) => { this.dispatchChange(change); });
  }

  watchCollection(collection: string): Observable<ChangeDocTypes> {
    const changes$ = new ReplaySubject<ChangeDocTypes>();
    this.createWebSocket(collection, null, changes$);
    return changes$.share();
  }

  createWebSocket(collection: string, resumeAfter: any,
      changes$: ReplaySubject<ChangeDocTypes>) {
    let ws = new WebSocket(this.config.updateStreamURL);

    ws.onclose = () => {
      this.log.warning(`Watch socket closed for ${collection} collection, resuming..`);
      _.delay(() => this.createWebSocket(collection, resumeAfter, changes$), RECONNECT_DELAY_MS);
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

  dispatchChange(change: ChangeDocTypes) {
    if (isInsert(change) || isUpdate(change)) {
      this.store.dispatch(new LoadAction({
        collection: change.ns.coll,
        doc: change.fullDocument
      }));
    } else if (isDelete(change)) {
      this.store.dispatch(new DeleteAction({
        collection: change.ns.coll,
        id: change.documentKey._id
      }));
    } else {
      this.log.error(`Unknown change document received ${change}`);
      return;
    }
  }
}
