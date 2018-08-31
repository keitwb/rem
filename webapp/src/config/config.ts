function getFromLocalStorage<T>(key: string, def: T): T {
  const ls = localStorage.getItem(key);
  if (ls !== null) {
    return JSON.parse(ls);
  }

  return def;
}

let localConfig: Config;

export default class Config {
  // Make a Config instance based on values stored in local storage, updating the values in local
  // storage if they are modified.
  public static fromLocalStorage(): Config {
    if (localConfig) {
      return localConfig;
    }

    localConfig = new Config();

    for (const p in localConfig) {
      if (localConfig.hasOwnProperty(p)) {
        localConfig[p] = getFromLocalStorage(p, localConfig[p]);
      }
    }

    return new Proxy(localConfig, {
      set: (obj, prop, value) => {
        localStorage.setItem(prop as string, JSON.stringify(value));
        obj[prop] = value;
        return true;
      },
    });
  }

  public restHeartURL = "/db";
  public searchURL = "/es";
  public updateStreamerURL = "/updates";
}
