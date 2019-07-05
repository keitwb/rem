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
  return (
    <React.Fragment>
      {media.filename ? <div>{media.filename}</div> : null}
      <div>{media.metadata.description}</div>
      <a href={`${conf.dbStreamURL}/media-download/${media._id.toHexString()}`}>Download</a>
    </React.Fragment>
  );
};

export default MediaDetail;

export const MediaDetailById: React.SFC<{ id: ObjectID }> = ({ id }) => {
  const media = useModel(CollectionName.MediaFiles, id);
  return <MediaDetail media={media} />;
};
