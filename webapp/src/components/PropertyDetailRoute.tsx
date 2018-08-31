import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router-dom";

import Config from "@/config/config";
import { Property } from "@/model/models";
import { MongoClient } from "@/model/mongo";
import { AppState } from "@/store/reducers";
import PropertyDetail from "./PropertyDetail";

interface Props extends RouteComponentProps<{ id: string }> {
  property: Property;
}

const PropertyDetailRoute: React.SFC<Props> = ({ property }) => {
  return <PropertyDetail property={property} />;
};

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {
    property: state.db.properties[ownProps.match.params.id],
  };
};
export default connect(mapStateToProps)(PropertyDetailRoute);
