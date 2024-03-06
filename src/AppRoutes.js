import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import LoginPage from "./auth/login";
import OTPPage from "./auth/otp";
import Layout from "./containers";
import Logout from "./containers/Logout";

const AppRoutes = (props) => {
  return (
    <Switch>
      <Route
        path="/logout"
        name="Logout"
        render={(props) => <Logout {...props} />}
      />
      <Route
        path="/home"
        name="home"
        render={(props) => <Layout {...props} />}
      />
      <Route
        path="/login"
        name="Login"
        render={(props) => <LoginPage {...props} />}
      />
      <Route
        path="/verify"
        name="Login Verify"
        render={(props) => <OTPPage {...props} />}
      />
      <Redirect from="/" to="/home" />
    </Switch>
  );
};

export default AppRoutes;
