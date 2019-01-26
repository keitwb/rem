import { ObjectId } from "bson";
import { createAction } from "typesafe-actions";

import { MongoDoc } from "@/model/models.gen";
import { ModelUpdate } from "@/model/updates";

export const loadOne = createAction("[db] Load", resolve => {
  return (collection: string, doc: MongoDoc) => resolve({ collection, doc });
});

export const deleteOne = createAction("[db] Delete", resolve => {
  return (collection: string, id: ObjectId) => resolve({ collection, id });
});

export const fetch = createAction("[db] Fetch", resolve => {
  return (collection: string, ids: ObjectId[], force: boolean = false) => resolve({ collection, ids, force });
});

export const fetchFailed = createAction("[db] Fetch Failed", resolve => {
  return (collection: string, ids: ObjectId[], err: Error) => resolve({ collection, ids, err: err.message });
});

export const modifyOne = createAction("[db] Modify", resolve => {
  return (collection: string, id: ObjectId, updates: Array<ModelUpdate<any>>) => resolve({ collection, id, updates });
});

export const modifyFailed = createAction("[db] Modify Failed", resolve => {
  return (collection: string, id: ObjectId, updates: Array<ModelUpdate<any>>, err: Error) =>
    resolve({ collection, id, updates, err });
});
