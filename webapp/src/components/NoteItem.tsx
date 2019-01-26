import * as React from "react";

import { CollectionName, Note } from "@/model/models.gen";
import { truncate } from "@/util/string";

import { connectOneModelById } from "./connectModels";

const NoteItem: React.SFC<{ instance: Note }> = ({ instance }) => {
  if (!instance) {
    return <div>Loading...</div>;
  }

  return (
    <React.Fragment>
      {instance.title ? <div>{instance.title}</div> : null}
      {truncate(instance.note, 100)}
    </React.Fragment>
  );
};

export default NoteItem;

export const NoteItemConnected = connectOneModelById(CollectionName.Notes, NoteItem);
