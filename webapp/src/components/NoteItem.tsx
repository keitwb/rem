import * as React from "react";

import { Note } from "@/model/models.gen";
import { truncate } from "@/util/string";

import styles from "./NoteItem.css";

const NoteItem: React.SFC<{ note: Note }> = ({ note }) => {
  if (!note) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.root}>
      {note.title ? <div>{note.title}</div> : null}
      {truncate(note.note, 100)}
    </div>
  );
};

export default NoteItem;
