import * as React from "react";
import { Link } from "react-router-dom";

import { TagLabel } from "./TagDetail";

interface Props {
  tags: string[];
  onRemove: (removedTag: string) => void;
}

const TagList: React.SFC<Props> = ({ tags, onRemove }) => {
  if (!tags || !tags.length) {
    return <div>No tag</div>;
  }

  return (
    <div>
      {tags.map(tag => (
        <div key={tag}>
          <Link to={`/tag/${tag}`}>
            <TagLabel tag={tag} />
          </Link>
          <span onClick={() => onRemove(tag)}>X</span>
        </div>
      ))}
    </div>
  );
};

export default TagList;
