import * as React from "react";

import { SearchHit, SearchResults } from "@/backend/search";
import { capitalize } from "@/util/string";

import SearchResultItem from "./SearchResultItem";

interface Props {
  onSelect: () => void;
  results: SearchResults<any>;
}

const SearchResultList: React.SFC<Props> = ({ onSelect, results }) => {
  const hitsByIndex = groupHitsByIndex(results.hits.hits);
  return (
    <div className="border border-secondary border-top-0 bg-light">
      {results ? (
        results.hits.total === 0 ? (
          <div>No results</div>
        ) : (
          Array.from(hitsByIndex.entries()).map(entry => {
            const [index, hits] = entry;
            return (
              <div key={index}>
                <div className="font-weight-bold">{capitalize(index)}</div>
                <div className="list-group">
                  {hits.map(h => (
                    <div key={h._id}>
                      <SearchResultItem onSelect={onSelect} hit={h} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )
      ) : null}
    </div>
  );
};
export default SearchResultList;

function groupHitsByIndex(hits: Array<SearchHit<any>>): Map<string, Array<SearchHit<any>>> {
  const hitsByIndex = new Map<string, Array<SearchHit<any>>>();
  for (const hit of hits) {
    const index = hit._index;
    if (!hitsByIndex.has(index)) {
      hitsByIndex.set(index, []);
    }
    hitsByIndex.get(index).push(hit);
  }
  return hitsByIndex;
}
