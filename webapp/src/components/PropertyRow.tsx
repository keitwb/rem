import { History } from "history";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";

import { CollectionName, Property } from "@/model/models.gen";

import { connectOneModelById } from "./connectModels";

interface Props {
  instance: Property;
}

function goToPropertyDetail(history: History, property: Property) {
  history.push(`/property/${property._id.toString()}`);
}

export const PropertyRow: React.SFC<Props & RouteComponentProps<any>> = ({ history, instance }) =>
  instance ? (
    instance._error ? (
      <div>Error fetching: {instance._error}</div>
    ) : (
      <div onClick={() => goToPropertyDetail(history, instance)} className="row bg-light-hover pointer">
        <div className="col-2 text-truncate px-0">{instance.name}</div>
        <div className="col-8 text-truncate">{instance.description}</div>
        <div className="col-2 px-0">
          {instance.county}, {instance.state}
        </div>
      </div>
    )
  ) : (
    <div>Loading...</div>
  );

export const PropertyRowConnected = connectOneModelById(CollectionName.Properties, withRouter(PropertyRow));
export default PropertyRowConnected;
