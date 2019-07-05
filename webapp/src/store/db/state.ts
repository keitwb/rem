import * as models from "@/model/models.gen";

export interface MongoDocs<T extends models.MongoDoc> {
  [id: string]: T;
}

export interface ModelState<T extends models.MongoDoc> {
  docs: MongoDocs<T>;
}

export interface State {
  users: ModelState<models.User>;
  properties: ModelState<models.Property>;
  leases: ModelState<models.Lease>;
  notes: ModelState<models.Note>;
  parties: ModelState<models.Party>;
  "media.files": ModelState<models.Media>;
  insurancePolicies: ModelState<models.InsurancePolicy>;
}

export type CollectionName = keyof State;
