import * as models from "@/model/models";

export interface QueryResult {
  docIds: string[];
  returned: number;
  size: number;
  totalPages: number;
  inProgress: boolean;
  fetchError: string;
}

export interface MongoDocs<T extends models.MongoDoc> {
  [id: string]: T;
}

export interface ModelState<T extends models.MongoDoc> {
  docs: MongoDocs<T>;
  queryResults: { [queryId: string]: QueryResult };
  updateResults: { [id: string]: PersistResult };
  createResults: { [createId: string]: CreateResult };
}

export interface State {
  users: ModelState<models.User>;
  properties: ModelState<models.Property>;
  leases: ModelState<models.Lease>;
  notes: ModelState<models.Note>;
  parties: ModelState<models.Party>;
  media: ModelState<models.Media>;
}

export interface PersistResult {
  inProgress: boolean;
  error: string;
}

export interface CreateResult extends PersistResult {
  docId: string;
}

export type CollectionName = keyof State;
