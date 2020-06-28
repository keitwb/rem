// https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html is very useful
// reading for these form components.

import { default as genClassName } from "classnames";
import React, { useRef, useState } from "react";
import { Edit as EditIcon } from "react-bytesize-icons";

import styles from "./EditableField.css";

type InputValidator<T> = (value: T) => Error;

interface Props<T> {
  value: T;
  onUpdate: (value: T) => void;
  renderInput?: (ref: React.RefObject<HTMLInputElement>, value: T, done: () => void) => React.ReactNode;
  placeholder?: string;
  validator?: InputValidator<T>;
  className?: string;
}

type ValueConverter<T> = (newVal: string) => T;

export default function makeEditableField<T>(converter: ValueConverter<T>) {
  function EditableField({
    value,
    onUpdate,
    renderInput,
    placeholder,
    validator,
    className,
    children,
  }: React.PropsWithChildren<Props<T>>) {
    if (!renderInput) {
      renderInput = (ref: React.RefObject<HTMLInputElement>, val: any, done: () => void): React.ReactNode => (
        <input autoFocus ref={ref} type="text" defaultValue={val} onBlur={done} />
      );
    }

    const inputRef = useRef<HTMLInputElement>();

    const [editing, setEditing] = useState(false);
    const [error, setError] = useState(null);
    const [showEditButton, setShowEditButton] = useState(false);

    function validate(newVal: T): boolean {
      if (validator) {
        const valErr = validator(newVal);
        if (valErr) {
          setError(error.toString());
          return false;
        }
      }
      return true;
    }

    function doSave(): void {
      const converted = converter(inputRef.current.value);
      if (!validate(converted)) {
        return;
      }
      onUpdate(converted);
      toggleEditing();
    }

    function toggleEditing() {
      setEditing(!editing);
      setError(null);
    }

    return (
      <div
        className={genClassName({ [styles.root]: true, [className]: true })}
        onMouseEnter={() => setShowEditButton(true)}
        onMouseLeave={() => setShowEditButton(false)}
        onDoubleClick={() => (!editing ? toggleEditing() : null)}
        onKeyDown={e => {
          if (!editing) {
            return;
          }
          if (e.key === "Escape") {
            toggleEditing();
          }
          if (e.key === "Enter") {
            doSave();
          }
        }}
      >
        {editing ? (
          <>
            {renderInput(inputRef, value, () => toggleEditing())}
            {error ? <div className="std-error">{error}</div> : undefined}
            <button type="button" onClick={() => doSave()}>
              Save
            </button>
          </>
        ) : (
          <>
            {children}
            {!value && placeholder && <div className={styles.placeholder}>{placeholder}</div>}
            {(showEditButton || (!value && !placeholder)) && (
              <div className={styles.editButton} onClick={() => toggleEditing()}>
                <EditIcon width={16} height={16} />
              </div>
            )}
          </>
        )}
      </div>
    );
  }
  return EditableField;
}
