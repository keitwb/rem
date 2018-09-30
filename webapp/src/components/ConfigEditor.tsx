import * as React from "react";

import Config from "@/config/config";

interface State {
  config: Config;
}

export default class ConfigEditor extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      config: Config.fromLocalStorage(),
    };
  }

  public render() {
    return (
      <div className="container">
        <h1 className="mt-3">App Config</h1>
        <p className="lead">Set the URLs that the app uses for various backend services</p>
        <form>
          <div className="form-group row align-items-center">
            <label className="col-sm-2 col-form-label">DB Stream URL:</label>
            <div className="col-sm-5">
              <input
                type="text"
                className="form-control"
                value={this.state.config.dbStreamURL}
                onChange={e => {
                  this.state.config.dbStreamURL = e.target.value;
                  this.forceUpdate();
                }}
              />
            </div>
          </div>
          <div className="form-group row align-items-center">
            <label className="col-sm-2 col-form-label">Change Stream URL:</label>
            <div className="col-sm-5">
              <input
                type="text"
                className="form-control"
                value={this.state.config.changeStreamURL}
                onChange={e => {
                  this.state.config.changeStreamURL = e.target.value;
                  this.forceUpdate();
                }}
              />
            </div>
          </div>
          <div className="form-group row align-items-center">
            <label className="col-sm-2 col-form-label">Search Stream URL:</label>
            <div className="col-sm-5">
              <input
                type="text"
                className="form-control"
                value={this.state.config.searchStreamURL}
                onChange={e => {
                  this.state.config.searchStreamURL = e.target.value;
                  this.forceUpdate();
                }}
              />
            </div>
          </div>
        </form>
      </div>
    );
  }
}
