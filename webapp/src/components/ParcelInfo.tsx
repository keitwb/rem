import * as React from "react";

import { Property } from "@/model/models.gen";
import TaxBill from "./TaxBill";

interface Props {
  property: Property;
  pin: string;
}

const ParcelInfo: React.SFC<Props> = ({ property, pin }) => {
  const taxPropInfo = (property.taxPropInfo || {})[pin] || {};
  return (
    <div>
      <div>PIN: {pin}</div>
      {taxPropInfo.legalDescription ? <div>Legal Description: {taxPropInfo.legalDescription}</div> : null}

      {Object.keys(property.taxBills || {}).map(year => (
        <TaxBill key={year} property={property} pin={pin} year={year} />
      ))}
    </div>
  );
};
export default ParcelInfo;
