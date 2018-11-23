import { ModelUpdate } from "./common";

// tslint:disable:max-classes-per-file

class PushArrayUpdate<T, K extends keyof T> implements ModelUpdate<T> {
  public readonly type = "push";
  constructor(readonly fieldName: K, readonly value: T[K]) {}

  get updateObj() {
    return { $push: { [this.fieldName]: this.value } };
  }
}

export function push<T, K extends keyof T = keyof T>(fieldName: K, value: T[K]): PushArrayUpdate<T, K> {
  return new PushArrayUpdate(fieldName, value);
}

class PullArrayUpdate<T, K extends keyof T> implements ModelUpdate<T> {
  public readonly type = "pull";
  constructor(readonly fieldName: K, readonly value: T[K]) {}

  get updateObj() {
    return { $pull: { [this.fieldName]: this.value } };
  }
}

export function pull<T, K extends keyof T = keyof T>(fieldName: K, value: T[K]): PullArrayUpdate<T, K> {
  return new PullArrayUpdate(fieldName, value);
}
