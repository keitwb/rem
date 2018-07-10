import { library } from "@fortawesome/fontawesome-svg-core";
import { faStroopwafel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import * as ReactDOM from "react-dom";

import App from "./components/App";

library.add(faStroopwafel);

ReactDOM.render(<App />, document.getElementById("app"));
