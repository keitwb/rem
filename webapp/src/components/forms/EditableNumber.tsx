import toNumber from "lodash-es/toNumber";

import EditableField from "./EditableField";

export default class EditableNumber extends EditableField<number> {
  protected convertValue(val: string): number {
    return val !== "" ? toNumber(val) : null;
  }
}
