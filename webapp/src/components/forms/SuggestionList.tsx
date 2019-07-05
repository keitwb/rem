import React, { useEffect, useState } from "react";

import classNames from "classnames";

import useKeyPress from "@/components/hooks/useKeyPress";

import styles from "./SuggestionList.css";

interface Props {
  suggestions: string[];
  onSelect: (s: string) => void;
}

/**
 * This is an "uncontrolled component" that provides a text input that shows suggestions as the user is
 * typing.
 */
export default function SuggestionList({ suggestions, onSelect }: Props) {
  const [selectedIndex, setSelectedIndex] = useState();

  useEffect(() => {
    setSelectedIndex(suggestions && suggestions.length > 0 ? 0 : null);
  }, [suggestions]);

  function onSelectInner(s: string) {
    onSelect(s);
  }

  useKeyPress(
    null,
    k => {
      if (k === "ArrowDown") {
        const newIdx = Math.min(suggestions.length - 1, selectedIndex + 1);
        setSelectedIndex(newIdx);
      } else if (k === "ArrowUp") {
        const newIdx = Math.max(-1, selectedIndex - 1);
        setSelectedIndex(newIdx);
      } else if (k === "Escape") {
        setSelectedIndex(-1);
      } else if (k === "Enter" && selectedIndex >= 0) {
        setSelectedIndex(-1);
        onSelectInner(suggestions[selectedIndex]);
        return false;
      }
    },
    null
  );

  return (
    <div className={styles.root}>
      {suggestions.map((s, i) => (
        <div
          key={s}
          className={classNames({
            [styles.selected]: i === selectedIndex,
          })}
          onMouseEnter={() => setSelectedIndex(i)}
          onClick={() => onSelectInner(s)}
        >
          {s}
        </div>
      ))}
    </div>
  );
}
