import toNumber from "lodash-es/toNumber";

import makeEditableField from "./EditableField";

const EditableNumber = makeEditableField<number>(function convertValue(val: string): number {
  return val !== "" ? toNumber(val) : null;
});
export default EditableNumber;
