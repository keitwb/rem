import { ObjectID } from "bson";
import * as React from "react";

import { mongoDocModifiedDateSorter } from "@/model/helpers";
import { CollectionName, Note } from "@/model/models.gen";

import useModelList from "./hooks/useModelList";
import NoteItem from "./NoteItem";

const NoteList: React.SFC<{ notes: Note[] }> = ({ notes }) => {
  if (!notes) {
    return <div>Loading...</div>;
  }

  if (notes.length === 0) {
    return <div>No notes</div>;
  }

  return (
    <div>
      {notes.sort(mongoDocModifiedDateSorter).map(note => (
        <NoteItem key={note.note} note={note} />
      ))}
    </div>
  );
};

export default NoteList;

export const NoteListByIds: React.SFC<{ ids: ObjectID[] }> = ({ ids }) => {
  const notes = useModelList(CollectionName.Notes, ids);

  return <NoteList notes={notes} />;
};
