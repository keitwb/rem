import { ObjectID } from "bson";
import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { logger } from "@/util/log";

import BadRoute from "./BadRoute";
import ConfigEditor from "./ConfigEditor";
import PropertyCreate from "./PropertyCreate";
import { PropertyDetailById } from "./PropertyDetail";
import PropertyOverview from "./PropertyOverview";
import TagDetail from "./TagDetail";
import TopBar from "./TopBar";

import styles from "./App.css";

export default class App extends React.Component {
  public componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error(error, info);
  }

  public render() {
    return (
      <BrowserRouter>
        <div className={styles.container}>
          <div className={styles.topBar}>
            <TopBar />
          </div>
          <div className={styles.main}>
            <Switch>
              <Route path="/config" render={() => <ConfigEditor />} />
              <Route
                path="/tag/:tag"
                render={({ match }) => {
                  return <TagDetail tag={match.params.tag} />;
                }}
              />
              <Route exact path="/property/new" component={PropertyCreate} />
              <Route
                path="/property/:id"
                render={({ match }) => {
                  return <PropertyDetailById id={new ObjectID(match.params.id)} />;
                }}
              />
              <Route exact path="/" component={PropertyOverview} />
              <Route component={BadRoute} />
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}
