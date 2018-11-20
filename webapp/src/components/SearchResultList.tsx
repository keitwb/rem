import * as React from "react";

import { SearchHit, SearchResults } from "@/backend/search";
import { capitalize } from "@/util/string";

import SearchResultItem from "./SearchResultItem";

interface Props {
  results: SearchResults;
}

const SearchResultList: React.SFC<Props> = ({ results }) => {
  const hitsByIndex = groupHitsByIndex(results.hits.hits);
  return (
    <div className="border border-secondary border-top-0">
      {results ? (
        results.hits.total === 0 ? (
          <div>No results</div>
        ) : (
          Array.from(hitsByIndex.entries()).map(entry => {
            const [index, hits] = entry;
            return (
              <div key={index}>
                <div>{capitalize(index)}</div>
                <ul className="list-group">
                  {hits.map(h => (
                    <li key={h._id}>
                      <SearchResultItem hit={h} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )
      ) : null}
    </div>
  );
};
export default SearchResultList;

function groupHitsByIndex(hits: SearchHit[]): Map<string, SearchHit[]> {
  const hitsByIndex = new Map<string, SearchHit[]>();
  for (const hit of hits) {
    const index = hit._index;
    if (!hitsByIndex.has(index)) {
      hitsByIndex.set(index, []);
    }
    hitsByIndex.get(index).push(hit);
  }
  return hitsByIndex;
}
