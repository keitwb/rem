import debounce from "debounce";
import React, { useRef, useState } from "react";

import { SearchClient } from "@/backend/search";
import useKeyPress from "@/components/hooks/useKeyPress";
import useOutsideClick from "@/components/hooks/useOutsideClick";
import { withErr } from "@/util/errors";

import SearchResultList from "./SearchResultList";

import styles from "./SearchBar.css";

interface Props {
  searchClient: SearchClient;
}

const SearchBar: React.SFC<Props> = ({ searchClient }: Props) => {
  const [showResults, setShowResults] = useState(false);
  const [, setSearching] = useState(false);
  const [err, setErr] = useState(null);
  const [results, setResults] = useState(null);
  const ref = useRef();

  const doSearchDebounced = debounce((q: string) => doSearch(q), 100);
  useOutsideClick(
    ref,
    () => {
      setShowResults(false);
    },
    [showResults]
  );

  useKeyPress(
    "Escape",
    () => {
      setShowResults(false);
      setErr(null);
    },
    [showResults]
  );

  async function doSearch(query: string) {
    setErr(null);
    setSearching(true);
    const [searchResults, error] = await withErr(searchClient.queryByString(query));
    setSearching(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setShowResults(true);
    setResults(searchResults);
  }

  return (
    <div ref={ref} className={styles.root}>
      <form>
        <input type="text" placeholder="Global Search" onChange={e => doSearchDebounced(e.target.value)} />
      </form>
      <div className={styles.results}>
        {err ? <span className={styles.error}>{err}</span> : null}
        {showResults && results ? <SearchResultList onSelect={() => setShowResults(false)} results={results} /> : null}
        {showResults && !results ? <div>No results found</div> : null}
      </div>
    </div>
  );
};

export default SearchBar;
