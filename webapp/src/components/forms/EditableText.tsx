import makeEditableField from "./EditableField";

const EditableText = makeEditableField<string>(function convertValue(val: string): string {
  return val;
});
export default EditableText;
