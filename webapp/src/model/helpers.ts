import { MongoDoc, TaxBill } from "./models.gen";

// Sorts docs descending by their modifiedDate field
export function mongoDocModifiedDateSorter<T extends MongoDoc>(a: T, b: T) {
  return (
    (a.modifiedDate ? new Date(a.modifiedDate).valueOf() : 0) -
    (b.modifiedDate ? new Date(b.modifiedDate).valueOf() : 0)
  );
}

// Unfortunately we can't very easily add this as a method to TaxBill, even though that would be
// most natural.
export function taxBillTotalPaidCents(taxBill: TaxBill): number {
  return (taxBill.payments || []).reduce((acc, p) => p.amountCents + acc, 0);
}

export function taxBillTotalDueCents(taxBills: TaxBill): number {
  if (taxBills.lineItems) {
    return null;
  }
  return taxBills.lineItems.reduce((acc, li) => li.amountCents + acc, 0);
}
