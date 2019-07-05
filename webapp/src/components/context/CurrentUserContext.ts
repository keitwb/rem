import * as React from "react";

import { User } from "@/model/models.gen";

const CurrentUserContext = React.createContext<User>(null);

export default CurrentUserContext;
