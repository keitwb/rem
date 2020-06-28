import * as React from "react";
import { Link } from "react-router-dom";

import { Highlight, SearchHit } from "@/backend/search";
import { CollectionName } from "@/model/models.gen";
import { capitalize, truncate } from "@/util/string";

import styles from "./SearchResultItem.css";

interface Props {
  hit: SearchHit<any>;
  onSelect: () => void;
}

const SearchResultItem: React.SFC<Props> = ({ hit, onSelect }) => {
  let content;
  let pathCollection;

  switch (hit._index.replace(/-.*/, "")) {
    case CollectionName.Properties:
      pathCollection = "property";
      content = hit._source.name;
      break;
    case CollectionName.Leases:
      pathCollection = "lease";
      content = hit._source.description;
      break;
    case CollectionName.Parties:
      pathCollection = "party";
      content = hit._source.name;
      break;
    case CollectionName.Notes:
      pathCollection = "note";
      content = hit._source.note;
      break;
    case CollectionName.MediaFiles.replace(".files", ""):
      pathCollection = "media";
      content = `${hit._source.filename} - ${hit._source.description}`;
      break;
    default:
      throw new Error(`Unknown search index result type: ${hit._index}`);
  }
  return (
    <Link onClick={onSelect} className="no-link-colors no-link-underline" to={`/${pathCollection}/${hit._id}`}>
      <div className={`${styles.item} bg-light-hover`}>
        {truncate(content, 40)}
        {highlightContent(hit.highlight)}
      </div>
    </Link>
  );
};
export default SearchResultItem;

/*
 * The content that comes from the ElasticSearch highlighter
 */
function highlightContent(highlight: Highlight): React.ReactNode {
  if (!highlight) {
    return null;
  }
  return (
    <div>
      {Object.keys(highlight).map(field => (
        <div key={field}>
          <span className="font-weight-light font-italic">{capitalize(field.replace(/\..*$/, ""))}:</span>{" "}
          {parseHighlightValue(highlight[field][0])}
        </div>
      ))}
    </div>
  );
}

// Convert the <em /> tags in the string to JSX so we don't have to use dangerous HTML literal
// rendering technique.
function parseHighlightValue(hi: string): React.ReactNode[] {
  return hi.split(/<\/?em>/).map((p, i) => (
    <span key={i} style={{ fontWeight: i % 2 === 0 ? "normal" : "bold" }}>
      {p}
    </span>
  ));
}
