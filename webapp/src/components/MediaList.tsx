import { ObjectID } from "bson";
import * as React from "react";

const MediaList: React.SFC<{ mediaIds: ObjectID[] }> = ({ mediaIds }) => (
  <ul>
    {mediaIds.map(id => (
      <li key={id.toString()}>{id.toString()}</li>
    ))}
  </ul>
);

export default MediaList;
