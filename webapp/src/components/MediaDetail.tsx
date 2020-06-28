import { ObjectID } from "bson";
import * as React from "react";

import * as Config from "@/config/config";
import { CollectionName, Media } from "@/model/models.gen";

import useModel from "./hooks/useModel";

const MediaDetail: React.SFC<{ media: Media }> = ({ media }) => {
  if (!media) {
    return <div>Loading...</div>;
  }

  const conf = Config.fromLocalStorage();
  const idAsHex = media._id.toHexString();

  return (
    <React.Fragment>
      <a href={`${conf.dataStreamURL.replace(/^ws/, "http")}/media-download/${idAsHex}`}>{media.filename}</a>
      <div>{media.metadata.description}</div>
    </React.Fragment>
  );
};

export default MediaDetail;

export const MediaDetailById: React.SFC<{ id: ObjectID }> = ({ id }) => {
  const media = useModel(CollectionName.MediaFiles, id);
  return <MediaDetail media={media} />;
};
