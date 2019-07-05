import React, { useContext } from "react";
import { Link } from "react-router-dom";

import SearchContext from "./context/SearchContext";
import SearchBar from "./SearchBar";
import TopBarUser from "./TopBarUser";

import styles from "./TopBar.css";

export const TopBar: React.SFC<{}> = () => {
  const searchClient = useContext(SearchContext);

  return (
    <div className={styles.root}>
      <Link to="/">REM</Link>
      <div className={styles.searchBar}>
        <SearchBar searchClient={searchClient} />
      </div>
      <Link to="/people">People</Link>
      <TopBarUser />
    </div>
  );
};
export default TopBar;
