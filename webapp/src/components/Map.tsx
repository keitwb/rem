import * as React from "react";

import "ol/ol.css";

import uniqueId from "lodash-es/uniqueId";
import TileLayer from "ol/layer/tile";
import { default as OLMap } from "ol/map";
import OSM from "ol/source/osm";
import View from "ol/view";

import * as models from "@/model/models.gen";

interface Props {
  properties: models.Property[];
}

export default class Map extends React.Component<Props> {
  // private map: Map;
  private mapId: string;

  constructor(props: Props) {
    super(props);

    this.mapId = uniqueId("map-");
  }

  public componentDidMount() {
    // tslint:disable:no-unused-expression
    // this.map =
    new OLMap({
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
    return <div id={this.mapId} className="w-100" />;
  }
}
