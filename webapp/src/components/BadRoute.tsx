import * as React from "react";
import { RouteProps } from "react-router";

const BadRoute: React.SFC<RouteProps> = ({ location }) => <div>Invalid path: {location.pathname}</div>;

export default BadRoute;
