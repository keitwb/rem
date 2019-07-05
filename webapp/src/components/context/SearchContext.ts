import * as React from "react";

import { SearchClient } from "@/backend/search";

const SearchContext = React.createContext<SearchClient>(null);

export default SearchContext;
