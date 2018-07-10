import { ModelUpdate } from "./common";

class PushArrayUpdate implements ModelUpdate {
  public readonly type = "push";
  constructor(readonly fieldName: string, readonly value: string) {}

  get updateObj() {
    return { $push: { [this.fieldName]: this.value } };
  }
}

export function push(fieldName: string, value: string): PushArrayUpdate {
  return new PushArrayUpdate(fieldName, value);
}
