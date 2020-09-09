import React from "react";
import { useMeQuery } from "../generated/graphql";
import { Redirect, Route } from "react-router-dom";

export const AuthRoute = ({ component: Component, ...props }: any) => {
  const { loading, data, error } = useMeQuery();

  if (error) {
    return <Redirect to="/404" />;
  }

  if (!loading && !data?.me) {
    return <Redirect to="/login" />;
  }
  return <Route component={Component} {...props} />;
};
