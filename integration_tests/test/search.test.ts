import * as assert from "assert";
import { By, until } from "selenium-webdriver";
import { getBrowser, goToPath } from "./browser";

describe("Search functionality", function() {
  it("should display relevant results for search", async function() {
    await goToPath("/");
    const elm = await getBrowser().wait(
      until.elementLocated(By.xpath("//input[@placeholder='Search']")),
      2000
    );
    await elm.sendKeys("Cumberl");
    const result = await getBrowser().wait(
      until.elementLocated(By.xpath("//a[text()='Industrial Complex']"))
    );
    assert.ok(result);
  });
});
