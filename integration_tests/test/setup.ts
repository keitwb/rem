/*
 * This is a setup module that configures the selenium server, running a selenium standalone server
 * if a selenium URL was not given via the envvar SELENIUM_REMOTE_URL.
 */

import * as Docker from "dockerode";
import * as fs from "fs";
import * as waitPort from "wait-port";

import * as browser from "./browser";

const seleniumImage = "selenium/standalone-chrome:3.14.0-krypton";

let seleniumCont: Docker.Container;

async function setup() {
  if (process.env.SELENIUM_REMOTE_URL) {
    browser.initFromEnv();
  } else {
    const docker = new Docker();

    await docker.pull(seleniumImage, {});
    seleniumCont = await docker.createContainer({
      Image: seleniumImage,
      AttachStdout: true,
      AttachStderr: true,
      HostConfig: {
        ExtraHosts: [`${process.env.INGRESS_HOST}:${process.env.INGRESS_IP}`]
      }
    });
    await seleniumCont.start();

    const contInfo = await seleniumCont.inspect();
    const ipAddr = contInfo.NetworkSettings.IPAddress;

    await waitPort({ host: ipAddr, port: 4444 });

    browser.manualInit(ipAddr);
  }
}

process.on("unhandledRejection", ex => {
  throw ex;
});

setup().then(run);

afterEach(async function() {
  if (this.currentTest.isFailed()) {
    const imageBase64 = await browser.getBrowser().takeScreenshot();
    fs.writeFileSync(
      `/tmp/${this.currentTest.fullTitle()}.png`,
      Buffer.from(imageBase64, "base64")
    );
  }
  return null;
});

after(async function() {
  if (seleniumCont) {
    await seleniumCont.remove({ force: true, timeout: 1 });
  }
});
