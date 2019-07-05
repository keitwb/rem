import { ObjectID } from "bson";
import classNames from "classnames";
import { History } from "history";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";

import { CollectionName, Property } from "@/model/models.gen";

import useModel from "./hooks/useModel";
import styles from "./PropertyRow.css";

interface Props extends RouteComponentProps<any> {
  property: Property;
}

function goToPropertyDetail(history: History, property: Property) {
  history.push(`/property/${property._id.toString()}`);
}

export const PropertyRow = withRouter<Props, React.SFC<Props>>(({ history, property }) =>
  property ? (
    property._error ? (
      <div className={styles.error}>Error fetching: {property._error}</div>
    ) : (
      <div onClick={() => goToPropertyDetail(history, property)} className={classNames("bg-light-hover", styles.row)}>
        <div className={styles.name}>{property.name}</div>
        <div className={styles.desc}>{property.description}</div>
        <div className={styles.location}>
          {property.city || property.county}, {property.state}
        </div>
      </div>
    )
  ) : (
    <div>Loading...</div>
  )
);
export default PropertyRow;

export const PropertyRowById = ({ id }: { id: ObjectID }) => {
  const property = useModel(CollectionName.Properties, id);
  return <PropertyRow property={property} />;
};
