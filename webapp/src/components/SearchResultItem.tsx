import * as React from "react";
import { Link } from "react-router-dom";

import { Highlight, SearchHit } from "@/backend/search";
import { CollectionName } from "@/model/models";
import { capitalize, truncate } from "@/util/string";

interface Props {
  hit: SearchHit;
}

const SearchResultItem: React.SFC<Props> = ({ hit }) => {
  let content;
  let pathCollection;

  switch (hit._index) {
    case CollectionName.Property:
      pathCollection = "property";
      content = hit._source.name;
      break;
    case CollectionName.Lease:
      pathCollection = "lease";
      content = hit._source.description;
      break;
    case CollectionName.Note:
      pathCollection = "note";
      content = hit._source.note;
      break;
    case CollectionName.Media:
      pathCollection = "media";
      content = `${hit._source.filename} - ${hit._source.description}`;
      break;
    default:
      throw new Error(`Unknown search index result type: ${hit._index}`);
  }
  return (
    <Link to={`/${pathCollection}/${hit._id}`}>
      {truncate(content, 40)}
      {highlightContent(hit.highlight)}
    </Link>
  );
};
export default SearchResultItem;

function highlightContent(highlight: Highlight): React.ReactNode {
  if (!highlight) {
    return null;
  }
  return (
    <div>
      {Object.keys(highlight).map(field => (
        <span key={field}>
          {capitalize(field)}: {parseHighlightValue(highlight[field][0])}
        </span>
      ))}
    </div>
  );
}

// Convert the <em /> tags in the string to JSX so we don't have to use dangerous HTML literal
// rendering technique.
function parseHighlightValue(hi: string): React.ReactNode[] {
  return hi.split(/<\/?em>/).map((p, i) => (
    <span key={i} className={i % 2 === 0 ? "" : "font-weight-bold"}>
      {p}
    </span>
  ));
}
