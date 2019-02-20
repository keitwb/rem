import { ObjectID } from "bson";
import merge from "lodash-es/merge";

import { MongoDoc } from "@/model/models.gen";
import { ModelUpdate } from "@/model/updates";
import RequestWebSocket from "./websocket/request";

export type SortOrder = "asc" | "desc";

interface UpdateResult {
  modifiedCount: number;
  upsertedId: ObjectID;
}

export class MongoClient {
  private ws: RequestWebSocket;

  constructor(dbStreamURL: string) {
    this.ws = new RequestWebSocket(dbStreamURL);
  }

  public async getOne<T extends MongoDoc>(collection: string, id: ObjectID): Promise<T> {
    const docs = await this.getMany<T>(collection, [id]);
    return docs[0];
  }

  public async getMany<T extends MongoDoc>(collection: string, ids: ObjectID[]): Promise<T[]> {
    const respIter = await this.ws.doRequest<{ doc: T }>({
      action: "getByIds",
      collection,
      ids,
    });

    const docs = [];
    for await (const doc of respIter) {
      docs.push(doc.doc);
    }

    return docs;
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
