import * as React from "react";

import Config from "@/config/config";
import { CollectionName, Media } from "@/model/models.gen";

import { connectOneModelById } from "./connectModels";

const MediaDetail: React.SFC<{ instance: Media }> = ({ instance }) => {
  if (!instance) {
    return <div>Loading...</div>;
  }

  const conf = Config.fromLocalStorage();
  return (
    <React.Fragment>
      {instance.filename ? <div>{instance.filename}</div> : null}
      <div>{instance.metadata.description}</div>
      <a href={`${conf.dbStreamURL}/media-download/${instance._id.toHexString()}`}>Download</a>
    </React.Fragment>
  );
};

export default MediaDetail;

export const MediaDetailConnected = connectOneModelById(CollectionName.MediaFiles, MediaDetail);
