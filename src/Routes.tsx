import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { App } from "./containers/App";
import { Register } from "./containers/Register";
import { Login } from "./containers/Login";
import { Error404 } from "./containers/Error404";
import { AuthRoute } from "./components/AuthRoute";
import { Chat } from "./containers/Chat";

export default () => {
  return (
    <Router>
      <Switch>
        <AuthRoute exact path="/" component={App} />
        <AuthRoute exact path="/chat/:id" component={Chat} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/404" component={Error404} />
      </Switch>
    </Router>
  );
};
