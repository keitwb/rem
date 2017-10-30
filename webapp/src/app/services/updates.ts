
export interface ModelUpdate {
  updateObj: object;
  type: string;
}

export function set(fieldName: string, value: string): SetFieldUpdate {
  return new SetFieldUpdate(fieldName, value);
}

export function push(fieldName: string, value: string): PushArrayUpdate {
  return new PushArrayUpdate(fieldName, value);
}

class SetFieldUpdate implements ModelUpdate {
  readonly type = "set";
  constructor(readonly fieldName: string, readonly value: string) { }

  get updateObj() {
    return {"$set": {[this.fieldName]: this.value}};
  }
}

class PushArrayUpdate implements ModelUpdate {
  readonly type = "push";
  constructor(readonly fieldName: string, readonly value: string) { }

  get updateObj() {
    return {"$push": {[this.fieldName]: this.value}};
  }
}
