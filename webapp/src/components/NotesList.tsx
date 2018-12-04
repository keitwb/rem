import { ObjectID } from "bson";
import * as React from "react";

import { NoteItemConnected } from "./NoteItem";

const NotesList: React.SFC<{ noteIds: ObjectID[] }> = ({ noteIds }) => {
  if (!noteIds) {
    return <div>No notes</div>;
  }

  return (
    <ul>
      {noteIds.map(id => (
        <li key={id.toString()}>
          <NoteItemConnected id={id.toString()} />
        </li>
      ))}
    </ul>
  );
};

export default NotesList;
