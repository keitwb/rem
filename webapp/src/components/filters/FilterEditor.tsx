import React, { useState } from "react";

import { splitLimit } from "@/util/string";

import SuggestedInput, { Suggestor } from "@/components/forms/SuggestedInput";

interface Props {
  name: string;
  val: string;
  onChange: (key: string, val: string) => void;
  suggestor: Suggestor;
  placeholder: string;
}

export function parseFilter(f: string): [string, string] {
  const [key, val] = splitLimit(f, ":", 1).map(s => s.trim());
  return [key, val];
}

// tslint:disable:max-line-length
/**
 * This component uses the state technique described at
 * https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
 */
export default function FilterEditor({ name, val, onChange, suggestor, placeholder }: Props) {
  const [filterText, setFilterText] = useState(deriveFilterText());

  function deriveFilterText() {
    return `${name}${val ? ": " + val : ""}`;
  }

  function processText(s: string) {
    const [key, value] = parseFilter(s);
    setFilterText(s);
    onChange(key, value);
    return;
  }
  return (
    <div>
      <SuggestedInput
        suggestor={suggestor}
        defaultValue={filterText}
        placeholder={placeholder}
        onChange={v => processText(v)}
      />
    </div>
  );
}
