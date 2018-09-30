import * as React from "react";

import "ol/ol.css";

import uniqueId from "lodash-es/uniqueId";
import TileLayer from "ol/layer/tile";
import Map from "ol/map";
import OSM from "ol/source/osm";
import View from "ol/view";

export default class PropertyOverview extends React.Component<{}, {}> {
  // private map: Map;
  private mapId: string;

  constructor(props: {}) {
    super(props);

    this.mapId = uniqueId("map-");
  }

  public componentDidMount() {
    // tslint:disable:no-unused-expression
    new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: this.mapId,
      view: new View({
        center: [0, 0],
        zoom: 7,
      }),
    });
  }

  public render() {
    return (
      <div className="container">
        <div id={this.mapId} className="w-100" />
      </div>
    );
  }
}
