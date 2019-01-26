import * as React from "react";

import { taxBillTotalDueCents, taxBillTotalPaidCents } from "@/model/helpers";
import { Property } from "@/model/models.gen";
import { formatCents } from "@/util/currency";

interface Props {
  property: Property;
  pin: string;
  year: string;
}

const TaxBill: React.SFC<Props> = ({ property, pin, year }) => {
  const taxBill = (property.taxBills[pin] || {})[year];
  if (!taxBill) {
    return (
      <div>
        No tax bill found for pin {pin} for {year}
      </div>
    );
  }

  const totalDue = taxBillTotalDueCents(taxBill);
  const totalPaid = taxBillTotalPaidCents(taxBill);
  return (
    <div>
      <div>Date: {taxBill.dueDate}</div>
      <div>Total: {formatCents(taxBillTotalDueCents(taxBill))}</div>
      <div>Line Items:</div>
      {(taxBill.lineItems || []).map(li => (
        <div>
          {li.description}: {formatCents(li.amountCents)}
        </div>
      ))}
      <div>{taxBill.lineItems.length > 0 ? (totalDue - totalPaid <= 0 ? "paid" : "UNPAID") : "unknown"}</div>
    </div>
  );
};

export default TaxBill;
