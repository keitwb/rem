import * as assert from "assert";
import { By, until } from "selenium-webdriver";
import { getBrowser, goToPath } from "./browser";

describe("Tag detail page", function() {
  it("should display relevant results for search", async function() {
    await goToPath("/tag/commercial");
    await getBrowser().wait(
      until.elementLocated(By.xpath("//*[text()='commercial']")),
      2000
    );
    const result = await getBrowser().wait(
      until.elementLocated(By.xpath("//a[text()='Industrial Complex']"))
    );
    assert.ok(result);
  });
});
