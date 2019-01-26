import { formatCents } from "./currency";

describe("formatCents", () => {
  // prettier-ignore
  test.each([
    [100, "$1.00"],
    [101, "$1.01"],
    [5, "$0.05"],
    [103498, "$1034.98"],
    [99, "$0.99"],
    [0, "$0.00"],
  ])(
    "formatCents(%d)",
    (cents, expected) => {
      expect(formatCents(cents)).toEqual(expected);
    }
  );
});
