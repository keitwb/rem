import * as React from "react";

import { mongoDocModifiedDateSorter } from "@/model/helpers";
import { CollectionName, Note } from "@/model/models.gen";

import { connectMultipleModelsById } from "./connectModels";
import NoteItem from "./NoteItem";

const NoteList: React.SFC<{ instances: Note[] }> = ({ instances }) => {
  if (!instances) {
    return <div>Loading...</div>;
  }

  if (instances.length === 0) {
    return <div>No notes</div>;
  }

  return (
    <div>
      {instances.sort(mongoDocModifiedDateSorter).map(note => (
        <div className="card" key={note._id.toString()}>
          <NoteItem instance={note} />
        </div>
      ))}
    </div>
  );
};

export default NoteList;

export const NoteListConnected = connectMultipleModelsById(CollectionName.Notes, NoteList);
