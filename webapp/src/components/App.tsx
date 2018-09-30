import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import Config from "@/config/config";
import { logger } from "@/util/log";

import ConfigEditor from "./ConfigEditor";
import connectModelById from "./connectModelById";
import SearchContext from "./context/SearchContext";
import PropertyDetail from "./PropertyDetail";
import PropertyOverview from "./PropertyOverview";
import SearchBar from "./SearchBar";

export default class App extends React.Component {
  public componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error(error, info);
  }

  public render() {
    return (
      <BrowserRouter>
        <div className="container">
          <SearchContext.Consumer>{searchClient => <SearchBar searchClient={searchClient} />}</SearchContext.Consumer>
          <Switch>
            <Route path="/config" render={() => <ConfigEditor config={Config.fromLocalStorage()} />} />
            <Route
              path="/property/:id"
              render={({ match }) => {
                const Component = connectModelById("properties", match.params.id, PropertyDetail);
                return <Component />;
              }}
            />
            <Route exact path="/" component={PropertyOverview} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}
