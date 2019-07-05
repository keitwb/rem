import * as React from "react";

import { DataClient } from "@/backend/data";

const DataClientContext = React.createContext<DataClient>(null);

export default DataClientContext;
