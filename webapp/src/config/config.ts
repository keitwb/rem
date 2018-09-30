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
    localConfig = new Config();

    return new Proxy(localConfig, {
      get: (obj, prop) => {
        return getFromLocalStorage(prop as string, obj[prop]);
      },
      set: (obj, prop, value) => {
        localStorage.setItem(prop as string, JSON.stringify(value));
        obj[prop] = value;
        return true;
      },
    });
  }

  public dbStreamURL = "/db";
  public changeStreamURL = "/changes";
  public searchStreamURL = "/search";
  public mediaUploadStreamURL = "/media";
}
