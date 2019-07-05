import React, { useImperativeHandle, useRef, useState } from "react";

import SuggestionList from "./SuggestionList";

import styles from "./SuggestedInput.css";

export type Suggestor = (input: string) => Promise<string[]>;

interface Props {
  suggestor: Suggestor;
  onChange?: (val: string) => void;
  name?: string;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
  size?: number;
}

/**
 * This is an "uncontrolled component" that provides a text input that shows suggestions as the user
 * is typing.
 */
const SuggestedInput = React.forwardRef<HTMLInputElement, Props>(
  ({ suggestor, name, size, onChange, defaultValue, className, placeholder }, forwardedRef) => {
    const ref = useRef<HTMLInputElement>();

    useImperativeHandle(forwardedRef, () => ref.current);

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    function onSelect(val: string) {
      setShowSuggestions(false);
      if (ref.current) {
        ref.current.value = val;
      }
      if (onChange) {
        onChange(val);
      }
    }

    async function processChange(val: string) {
      if (ref.current) {
        ref.current.value = val;
      }
      setSuggestions(await suggestor(val));
      setShowSuggestions(true);
      if (onChange) {
        onChange(val);
      }
    }

    return (
      <div className={styles.root}>
        <input
          autoFocus
          className={className}
          size={size}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          name={name}
          ref={ref}
          defaultValue={defaultValue}
          // Don't submit the form when suggestions are open
          onKeyDown={e => showSuggestions && e.key === "Enter" && e.preventDefault()}
          onChange={e => processChange(e.target.value)}
        />
        {showSuggestions ? <SuggestionList suggestions={suggestions} onSelect={onSelect} /> : null}
      </div>
    );
  }
);

export default SuggestedInput;
