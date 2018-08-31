import * as React from "react";

import EditableText from "@/components/forms/EditableText";
import { Property } from "@/model/models";

const PropertyDetail: React.SFC<{ property: Property }> = ({ property }) => (
  <div className="container">
    <EditableText
      value={property.name}
      onUpdate={val => {
        property.name = val;
      }}
    >
      <h2>{property.name}</h2>
    </EditableText>
  </div>
);

export default PropertyDetail;
