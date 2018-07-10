import * as React from "react";

import Hello from "./Hello";

export default class App extends React.Component {
  public componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // TODO: Log this out and send it to an error collection service on the backend
  }

  public render() {
    return <Hello compiler="TypeScript" framework="React" />;
  }
}
