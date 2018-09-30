import { ModelUpdate } from "./common";

class SetFieldUpdate<T, K extends keyof T> implements ModelUpdate<T> {
  public readonly type = "set";
  constructor(readonly fieldName: K, readonly value: T[K]) {}

  get updateObj() {
    return { $set: { [this.fieldName]: this.value } };
  }
}

export function set<T, K extends keyof T = keyof T>(fieldName: K, value: T[K]): SetFieldUpdate<T, K> {
  return new SetFieldUpdate(fieldName, value);
}

export function patchWithObject<T, K extends keyof T = keyof T>(obj: Partial<T>): Array<SetFieldUpdate<T, K>> {
  return Object.entries(obj).map(([k, v]) => set(k as K, v as T[K]));
}
