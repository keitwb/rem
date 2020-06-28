import "./style.css";

import { ObjectID } from "bson";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";

import { AuthManager } from "@/backend/auth";
import { DataClient } from "@/backend/data";
import { SearchClient } from "@/backend/search";
import App from "@/components/App";
import AuthContext from "@/components/context/AuthContext";
import CurrentUserContext from "@/components/context/CurrentUserContext";
import DataClientContext from "@/components/context/DataClientContext";
import SearchContext from "@/components/context/SearchContext";
import Login from "@/components/Login";
import * as Config from "@/config/config";
import { UserLogin } from "@/model/auth";
import { CollectionName, User } from "@/model/models.gen";
import { initStore } from "@/store";
import { syncBackendChangesToStore } from "@/store/sync/changestream";
import { logger } from "@/util/log";

import "typeface-open-sans";

async function ensureLoggedIn(authManager: AuthManager): Promise<UserLogin> {
  const [userLogin, err] = await authManager.currentUserLogin();
  if (err) {
    return new Promise<UserLogin>((resolve, _) => {
      ReactDOM.render(<Login authManager={authManager} onLoggedIn={resolve} />, document.getElementById("app"));
    });
  }
  return userLogin;
}

async function init() {
  const conf = Config.fromLocalStorage();

  const authManager = new AuthManager(conf.authURL);
  const userLogin = await ensureLoggedIn(authManager);
  const dataClientPromise = new DataClient(conf.dataStreamURL + "/db");
  const searchClientPromise = new SearchClient(conf.dataStreamURL + "/search");

  let dataClient: DataClient;
  try {
    dataClient = await dataClientPromise;
  } catch (err) {
    logger.error("Could not initialize data client stream: ", err);
  }

  let searchClient: SearchClient;
  try {
    searchClient = await searchClientPromise;
  } catch (err) {
    logger.error("Could not initialize search client stream: ", err);
  }

  const store = initStore(dataClient);
  syncBackendChangesToStore(store.dispatch);

  const currentUser = await dataClient.getOne<User>(CollectionName.Users, new ObjectID(userLogin.userId));

  ReactDOM.render(
    <AuthContext.Provider value={authManager}>
      <DataClientContext.Provider value={dataClient}>
        <CurrentUserContext.Provider value={currentUser}>
          <SearchContext.Provider value={searchClient}>
            <Provider store={store}>
              <App />
            </Provider>
          </SearchContext.Provider>
        </CurrentUserContext.Provider>
      </DataClientContext.Provider>
    </AuthContext.Provider>,
    document.getElementById("app")
  );
}

init();
