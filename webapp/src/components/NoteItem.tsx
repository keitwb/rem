import * as React from "react";

import { Note } from "@/model/models.gen";
import { truncate } from "@/util/string";

const NoteItem: React.SFC<{ note: Note }> = ({ note }) => {
  if (!note) {
    return <div>Loading...</div>;
  }

  return (
    <React.Fragment>
      {note.title ? <div>{note.title}</div> : null}
      {truncate(note.note, 100)}
    </React.Fragment>
  );
};

export default NoteItem;
