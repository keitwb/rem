import { defaults as defaultControls } from "ol/control";
import { default as Feature } from "ol/Feature";
import WKT from "ol/format/WKT";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { default as OLMap } from "ol/Map";
import OSM from "ol/source/OSM";
import WMSSource from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import View from "ol/View";

import * as models from "@/model/models.gen";

export default class MapManager {
  private map: OLMap;
  private parcelLayer: VectorLayer;
  private streetMapLayer: TileLayer;
  private aerialLayer: TileLayer;
  private selection: Feature;
  private wktFormat = new WKT();

  constructor(targetElm: HTMLDivElement) {
    this.parcelLayer = new VectorLayer({
      source: new VectorSource({}),
      style: feature => {
        const selected = this.selection ? this.selection.getId() === feature.getId() : false;
        return new Style({
          stroke: new Stroke({
            color: selected ? "rgba(200,20,20,0.8)" : "gray",
            width: selected ? 2 : 1,
          }),
          fill: new Fill({
            color: selected ? "rgba(200,20,20,0.2)" : "rgba(20,20,20,0.9)",
          }),
        });
      },
    });

    this.streetMapLayer = new TileLayer({
      source: new OSM({
        opaque: false,
      }),
      opacity: 0.8,
    });

    this.aerialLayer = new TileLayer({
      source: new WMSSource({
        url: "https://services.nconemap.gov/secure/services/Imagery/Orthoimagery_Latest/ImageServer/WMSServer",
        params: { LAYERS: "0" },
        crossOrigin: "anonymous",
      }),
    });

    this.map = new OLMap({
      layers: [this.aerialLayer, this.streetMapLayer, this.parcelLayer],
      controls: defaultControls(),
      target: targetElm,
      view: new View({
        projection: "EPSG:4326",
      }),
    });

    this.map.on("click", async event => {
      const features = await this.parcelLayer.getFeatures(event.pixel);

      if (!features.length) {
        this.selection = null;
      } else {
        const feature = features[0];
        if (!feature) {
          return;
        }
        // add selected feature to lookup
        this.selection = feature;
      }

      // force redraw of layer style
      this.parcelLayer.setStyle(this.parcelLayer.getStyle());
    });
  }

  public updateFeatures(properties: models.Property[]) {
    const features = (properties || []).reduce(
      (acc, p) =>
        acc.concat(
          extractParcelWKTs(p).map(wkt =>
            this.wktFormat.readFeature(wkt, {
              dataProjection: "EPSG:4326",
            })
          )
        ),
      []
    );

    this.parcelLayer.getSource().clear();
    this.parcelLayer.getSource().addFeatures(features);

    this.map.getView().fit(this.parcelLayer.getSource().getExtent(), {
      size: this.map.getSize(),
      padding: [50, 50, 50, 50],
    });
  }
}

function extractParcelWKTs(prop: models.Property): string[] {
  if (!prop.parcelData) {
    return [];
  }

  return Object.values(prop.parcelData)
    .map((pd: models.ParcelDatum) => pd.boundaryWKT)
    .filter(s => !!s);
}
