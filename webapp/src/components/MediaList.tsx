import { ObjectID } from "bson";
import * as React from "react";

const MediaListByIds: React.SFC<{ ids: ObjectID[] }> = ({ ids }) => {
  if (!ids) {
    return <div>No media</div>;
  }

  return (
    <ul>
      {ids.map(id => (
        <li key={id.toString()}>{id.toString()}</li>
      ))}
    </ul>
  );
};

export default MediaListByIds;
