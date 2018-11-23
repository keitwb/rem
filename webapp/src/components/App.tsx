import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import Config from "@/config/config";
import { logger } from "@/util/log";

import BadRoute from "./BadRoute";
import ConfigEditor from "./ConfigEditor";
import SearchContext from "./context/SearchContext";
import { PropertyDetailConnected } from "./PropertyDetail";
import PropertyOverview from "./PropertyOverview";
import SearchBar from "./SearchBar";
import TagDetail from "./TagDetail";

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
              path="/tag/:tag"
              render={({ match }) => {
                return <TagDetail tag={match.params.tag} />;
              }}
            />
            <Route
              path="/property/:id"
              render={({ match }) => {
                return <PropertyDetailConnected id={match.params.id} />;
              }}
            />
            <Route exact path="/" component={PropertyOverview} />
            <Route component={BadRoute} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}
