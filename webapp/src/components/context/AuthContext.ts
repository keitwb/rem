import * as React from "react";

import {AuthManager} from "@/backend/auth";

const AuthContext = React.createContext<AuthManager>(null);

export default AuthContext;
