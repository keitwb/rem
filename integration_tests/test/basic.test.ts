import * as assert from "assert";
import { getBrowser, goToPath } from "./browser";

describe("Basic functionality", function() {
  it("should load the initial page successfully", async function() {
    await goToPath("/");
    assert.equal(await getBrowser().getTitle(), "REM");
  });
});
