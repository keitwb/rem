function getFromLocalStorage<T>(key: string, def: T): T {
  const ls = localStorage.getItem(key);
  if (ls !== null) {
    return JSON.parse(ls);
  }

  return def;
}

function pageRelativeWebSocketPath(path: string): string {
  const l = window.location;
  return (l.protocol === "https:" ? "wss://" : "ws://") + l.host + path;
}

function pageRelativePath(path: string): string {
  const l = window.location;
  return (l.protocol === "https:" ? "https://" : "http://") + l.host + path;
}

export default interface Config {
  dbStreamURL: string;
  changeStreamURL: string;
  searchStreamURL: string;
  authURL: string;
}

const defaults: Config = {
  changeStreamURL: pageRelativeWebSocketPath("/stream/changes"),
  dbStreamURL: pageRelativeWebSocketPath("/stream/db"),
  searchStreamURL: pageRelativeWebSocketPath("/stream/search"),
  authURL: pageRelativePath("/auth"),
};

export function fromLocalStorage(): Config {
  return Object.keys(defaults).reduce((acc, k) => ({ ...acc, [k]: getFromLocalStorage(k, defaults[k]) }), {}) as Config;
}

export function toLocalStorage(c: Config) {
  Object.keys(c).forEach(k => {
    localStorage.setItem(k, JSON.stringify(c[k]));
  });
}
