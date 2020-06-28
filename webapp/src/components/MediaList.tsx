import { ObjectID } from "bson";
import * as React from "react";

import { mongoDocModifiedDateSorter } from "@/model/helpers";
import { CollectionName, Media } from "@/model/models.gen";
import useModelList from "./hooks/useModelList";
import MediaDetail from "./MediaDetail";

import styles from "./MediaList.css";

export function MediaList({ media }: { media: Media[] }) {
  if (!media || media.length === 0) {
    return <div>No media</div>;
  }

  return (
    <ul className={styles.root}>
      {media.sort(mongoDocModifiedDateSorter).map(m => (
        <li key={m._id.toHexString()}>
          <MediaDetail media={m} />
        </li>
      ))}
    </ul>
  );
}

const MediaListByIds: React.SFC<{ ids: ObjectID[] }> = ({ ids }) => {
  const media = useModelList(CollectionName.MediaFiles, ids);

  return <MediaList media={media} />;
};

export default MediaListByIds;
