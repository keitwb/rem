import * as React from "react";

import { Suggestor } from "@/components/forms/SuggestedInput";

import FilterEditor from "./FilterEditor";
import FilterItem from "./FilterItem";

interface Props {
  name: string;
  val: string;
  isEditing: boolean;
  placeholder: string;
  suggestor: Suggestor;
  onClick: () => void;
  onChange: (name: string, val: string) => void;
  onDelete: () => void;
}

const EditableFilterItem: React.SFC<Props> = ({
  name,
  val,
  isEditing,
  placeholder,
  suggestor,
  onClick,
  onChange,
  onDelete,
}) =>
  isEditing ? (
    // key is needed to reset state when name/val changes
    <FilterEditor
      name={name}
      val={val}
      key={`${name}:${val}`}
      suggestor={suggestor}
      onChange={(newName: string, newVal: string) => onChange(newName, newVal)}
      placeholder={placeholder}
    />
  ) : (
    <FilterItem onClick={onClick} name={name} val={val} onDelete={onDelete} />
  );

export default EditableFilterItem;
