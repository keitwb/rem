import { Builder, ThenableWebDriver } from "selenium-webdriver";

let browser: ThenableWebDriver;
export function getBrowser() {
  return browser;
}

export function manualInit(ipAddr: string) {
  browser = new Builder()
    .disableEnvironmentOverrides()
    .usingServer(`http://${ipAddr}:4444/wd/hub`)
    .forBrowser("chrome")
    .build();
}

export function initFromEnv() {
  browser = new Builder().build();
}

export async function goToPath(path: string) {
  await getBrowser().get(`http://${process.env.INGRESS_HOST}${path}`);
}
