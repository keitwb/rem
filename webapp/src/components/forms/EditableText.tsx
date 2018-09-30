import EditableField from "./EditableField";

export default class EditableText extends EditableField<string> {
  protected convertValue(val: string): string {
    return val;
  }
}
