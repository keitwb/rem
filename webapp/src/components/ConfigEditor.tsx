import * as React from "react";

import Config from "@/config/config";

const ConfigEditor: React.SFC<{ config: Config }> = ({ config }) => (
  <div className="container">
    <h1 className="mt-3">App Config</h1>
    <p className="lead">Set the URLs that the app uses for various backend services</p>
    <form>
      <div className="form-group row align-items-center">
        <label className="col-sm-2 col-form-label">RestHeart (Mongo) URL:</label>
        <div className="col-sm-5">
          <input
            className="form-control"
            type="text"
            value={config.restHeartURL}
            onChange={e => {
              config.restHeartURL = e.target.value;
            }}
          />
        </div>
      </div>
      <div className="form-group row align-items-center">
        <label className="col-sm-2 col-form-label">ElasticSearch URL:</label>
        <div className="col-sm-5">
          <input
            type="text"
            className="form-control"
            value={config.searchURL}
            onChange={e => {
              config.searchURL = e.target.value;
            }}
          />
        </div>
      </div>
      <div className="form-group row align-items-center">
        <label className="col-sm-2 col-form-label">Update Streamer URL:</label>
        <div className="col-sm-5">
          <input
            type="text"
            className="form-control"
            value={config.updateStreamerURL}
            onChange={e => {
              config.updateStreamerURL = e.target.value;
            }}
          />
        </div>
      </div>
    </form>
  </div>
);

export default ConfigEditor;
