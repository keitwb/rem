import React, { useContext, useState } from "react";

import { Link } from "react-router-dom";
import AuthContext from "./context/AuthContext";
import CurrentUserContext from "./context/CurrentUserContext";
import styles from "./TopBarUser.css";

export const TopBar: React.SFC<{}> = () => {
  const currentUser = useContext(CurrentUserContext);
  const authManager = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  return (
    <div className={styles.root}>
      <div onClick={_ => setShowDropdown(!showDropdown)}>
        <span className={styles.username}>{currentUser.username} &#x25BE;</span>
        {showDropdown ? (
          <ul>
            <li>Profile</li>
            <li onClick={_ => authManager.logout()}>Logout</li>
            <li>
              <Link to="/config">Config</Link>
            </li>
          </ul>
        ) : null}
      </div>
    </div>
  );
};
export default TopBar;
