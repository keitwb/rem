import React, { useEffect, useRef, useState } from "react";

import "ol/ol.css";

import { Extent } from "ol/extent";
import TileLayer from "ol/layer/Tile";
import { default as OLMap } from "ol/Map";
import OSM from "ol/source/OSM";
import View from "ol/View";

import * as models from "@/model/models.gen";

interface Props {
  properties: models.Property[];
}

export const Map: React.SFC<Props> = ({ properties }) => {
  const [map, setMap] = useState<OLMap>(null);
  const mapRef = useRef(null);

  useEffect(() => {
    setMap(
      new OLMap({
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        target: mapRef.current,
        view: new View({
          center: [-11718716.28195593, 4869217.172379018], // Boulder
          zoom: 13,
          // extent: getBounds(properties),
        }),
      })
    );
  }, []);

  useEffect(() => {
    if (!map) {
      return;
    }
    map.setView(
      new View({
        extent: getBounds(properties),
      })
    );
  }, [properties]);

  return <div ref={mapRef} style={{ width: "100%", height: "500px" }} />;
};
export default Map;

function getBounds(_: models.Property[]): Extent {
  return null;
}
