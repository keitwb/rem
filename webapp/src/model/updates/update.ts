import map from "lodash/map";
import toPairs from "lodash/toPairs";

import { ModelUpdate } from "./common";

class SetFieldUpdate implements ModelUpdate {
  public readonly type = "set";
  constructor(readonly fieldName: string, readonly value: string) {}

  get updateObj() {
    return { $set: { [this.fieldName]: this.value } };
  }
}

export function set(fieldName: string, value: string): SetFieldUpdate {
  return new SetFieldUpdate(fieldName, value);
}

export function patchWithObject(obj: object): SetFieldUpdate[] {
  return Object.entries(obj).map(([k, v]) => set(k, v));
}
