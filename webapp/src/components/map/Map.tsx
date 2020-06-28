import React, { useEffect, useRef, useState } from "react";

import "ol/ol.css";

import * as models from "@/model/models.gen";

import MapManager from "./manager";

interface Props {
  properties: models.Property[];
}

export const Map: React.SFC<Props> = ({ properties }) => {
  const [mapManager, setMapManager] = useState<MapManager>(null);
  const mapRef = useRef(null);

  useEffect(() => {
    setMapManager(new MapManager(mapRef.current));
  }, [mapRef]);

  useEffect(() => {
    if (!mapManager) {
      return;
    }
    mapManager.updateFeatures(properties);
  }, [mapRef, properties]);

  return <div ref={mapRef} style={{ width: "100%", height: "75vh" }} />;
};
export default Map;

