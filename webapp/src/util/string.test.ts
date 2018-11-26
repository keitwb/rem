import { splitLimit } from "./string";

describe("splitLimit", () => {
  // prettier-ignore
  test.each([
    ["", "_", 1, [""]],
    ["test_string", "_", 0, ["test_string"]],
    ["test_string", "_", 1, ["test", "string"]],
    ["test_string", "_", 2, ["test", "string"]],
    ["a_test_string", "_", 1, ["a", "test_string"]],
    ["a_test_string", "_", 2, ["a", "test", "string"]],
  ])(
    "splitLimit(%s, %s, %d)",
    (s, d, l, expected) => {
      expect(splitLimit(s, d, l)).toEqual(expected);
    }
  );
});
