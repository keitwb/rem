import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";

import { MongoClient } from "@/backend/mongo";
import { SearchClient } from "@/backend/search";
import App from "@/components/App";
import SearchContext from "@/components/context/SearchContext";
import Config from "@/config/config";
import { initStore } from "@/store";
import { syncBackendChangesToStore } from "@/store/sync/changestream";
import { logger } from "@/util/log";

import "./style.scss";

async function init() {
  const conf = Config.fromLocalStorage();
  const mongoClientPromise = MongoClient.create(conf.dbStreamURL);
  const searchClientPromise = SearchClient.create(conf.searchStreamURL);

  let mongoClient: MongoClient;
  try {
    mongoClient = await mongoClientPromise;
  } catch (err) {
    logger.error("Could not initialize Mongo client stream: ", err);
  }

  let searchClient: SearchClient;
  try {
    searchClient = await searchClientPromise;
  } catch (err) {
    logger.error("Could not initialize search client stream: ", err);
  }

  const store = initStore(mongoClient);
  syncBackendChangesToStore(store.dispatch);

  ReactDOM.render(
    <SearchContext.Provider value={searchClient}>
      <Provider store={store}>
        <App />
      </Provider>
    </SearchContext.Provider>,
    document.getElementById("app")
  );
}

init();
