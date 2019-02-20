import * as React from "react";

import { Property } from "@/model/models.gen";
import { formatCents } from "@/util/currency";

import ParcelInfo from "./ParcelInfo";

interface Props {
  property: Property;
  onRefreshRequested: () => void;
}

function sumTotalAppraisedCents(property: Property): number {
  return property.pinNumbers.reduce(
    (acc, pin) => acc + (((property.taxPropInfo || {})[pin] || {}).totalAppraisedCents || 0),
    0
  );
}

export const TaxInfo: React.SFC<Props> = ({ property, onRefreshRequested }) => {
  return (
    <div>
      {property ? (
        <div>
          <div>Current Tax Appraised Value: {formatCents(sumTotalAppraisedCents(property)) || "unknown"}</div>
          <div>Number of parcels: {property.pinNumbers.length}</div>
          <button disabled={property.taxRefreshRequested} onClick={() => onRefreshRequested()}>
            Refresh Tax Info
          </button>
          {property.taxRefreshRequested ? <span>Refreshing...</span> : null}
          {property.pinNumbers.map(pin => (
            <ParcelInfo key={pin} property={property} pin={pin} />
          ))}
        </div>
      ) : (
        <span>Loading...</span>
      )}
    </div>
  );
};
export default TaxInfo;
