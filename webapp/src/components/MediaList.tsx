import { ObjectID } from "bson";
import * as React from "react";

const MediaList: React.SFC<{ mediaIds: ObjectID[] }> = ({ mediaIds }) => {
  if (!mediaIds) {
    return <div>No media</div>;
  }

  return (
    <ul>
      {mediaIds.map(id => (
        <li key={id.toString()}>{id.toString()}</li>
      ))}
    </ul>
  );
};

export default MediaList;
