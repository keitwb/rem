import { ModelUpdate } from "./common";

class PushArrayUpdate<T, K extends keyof T> implements ModelUpdate<T> {
  public readonly type = "push";
  constructor(readonly fieldName: K, readonly value: T[K]) {}

  get updateObj() {
    return { $push: { [this.fieldName]: this.value } };
  }
}

export function push<T, K extends keyof T>(fieldName: K, value: T[K]): PushArrayUpdate<T, K> {
  return new PushArrayUpdate(fieldName, value);
}
