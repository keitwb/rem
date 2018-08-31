import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import Config from "@/config/config";
import { logger } from "@/util/log";

import ConfigEditor from "./ConfigEditor";
import PropertyDetailRoute from "./PropertyDetailRoute";
import PropertyOverview from "./PropertyOverview";

export default class App extends React.Component {
  public componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // TODO: Log this out and send it to an error collection service on the backend
    logger.error(`${error}\n${info}`);
  }

  public render() {
    return (
      <div className="container">
        <BrowserRouter>
          <Switch>
            <Route path="/config" render={() => <ConfigEditor config={Config.fromLocalStorage()} />} />
            {<Route path="/property/:id" component={PropertyDetailRoute} />}
            {/* <Route path="/property-group/:id" component={PropertyGroupDetail} /> */}
            <Route exact path="/" component={PropertyOverview} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}
