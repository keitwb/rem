import React, { useState } from "react";

import Config, { fromLocalStorage, toLocalStorage } from "@/config/config";

import styles from "./ConfigEditor.css";

const formItems = [
  { title: "DB Stream URL", value: "dbStreamURL" },
  { title: "Change Stream URL", value: "changeStreamURL" },
  { title: "Search Stream URL", value: "searchStreamURL" },
  { title: "Auth URL", value: "authURL" },
];

function useConfig(): [Config, (c: Config) => void] {
  const [config, setConfig] = useState(fromLocalStorage());

  return [
    config,
    (newConfig: Config) => {
      toLocalStorage(newConfig);
      return setConfig(newConfig);
    },
  ];
}

export default function ConfigEditor() {
  const [config, setConfig] = useConfig();

  return (
    <div className={styles.root}>
      <h1 className="header">App Config</h1>
      <p>Set the URLs that the app uses for various backend services</p>
      <form className={styles.form}>
        {formItems.map(fi => (
          <div key={fi.value}>
            <label>{fi.title}:</label>
            <input
              type="text"
              value={config[fi.value]}
              onChange={e => {
                setConfig({ ...config, [fi.value]: e.target.value });
              }}
            />
          </div>
        ))}
      </form>
    </div>
  );
}
