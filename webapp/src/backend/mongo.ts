import { ObjectID } from "bson";
import merge from "lodash-es/merge";

import { MongoDoc } from "@/model/models";
import { ModelUpdate } from "@/model/updates";
import RequestWebSocket from "./websocket/request";

export type SortOrder = "asc" | "desc";

interface UpdateResult {
  modifiedCount: number;
  upsertedId: ObjectID;
}

export class MongoClient {
  public static async create(dbStreamURL: string) {
    const ws = await RequestWebSocket.open(dbStreamURL);
    return new this(ws);
  }

  private ws: RequestWebSocket;

  constructor(ws: RequestWebSocket) {
    this.ws = ws;
  }

  public async getOne<T extends MongoDoc>(collection: string, id: ObjectID): Promise<T> {
    const resp = await this.ws.doSimpleRequest<{ doc: T }>({
      action: "getByIds",
      collection,
      ids: [id],
    });

    return resp.doc;
  }

  public async update<T extends MongoDoc>(
    collection: string,
    id: ObjectID,
    updates: Array<ModelUpdate<T>>
  ): Promise<unknown> {
    const req = {
      action: "upsert",
      collection,
      id,
      updates: merge({}, ...updates.map(u => u.updateObj)),
    };

    const resp = await this.ws.doSimpleRequest<UpdateResult>(req);
    if (resp.modifiedCount === 0) {
      throw new Error("No documents were modified");
    }
    return;
  }
}
