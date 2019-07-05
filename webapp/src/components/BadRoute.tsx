import * as React from "react";
import { RouteProps } from "react-router";

const BadRoute: React.SFC<RouteProps> = ({ location }) => <h2>Invalid path: {location.pathname}</h2>;

export default BadRoute;
