import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Login } from "./containers/Login";
import { App } from "./containers/App";
import { Error404 } from "./containers/Error404";
import { AuthRoute } from "./components/AuthRoute";
import { Chat } from "./containers/Chat";

export default () => {
  return (
    <Router>
      <Switch>
        <AuthRoute exact path="/" component={App} />
        <AuthRoute exact path="/chat/:id" component={Chat} />
        <Route path="/login" component={Login} />
        <Route path="/404" component={Error404} />
      </Switch>
    </Router>
  );
};
