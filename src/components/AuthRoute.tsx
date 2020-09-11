import React from "react";
import { useMeQuery } from "../generated/graphql";
import { Redirect, Route } from "react-router-dom";
import { CenteredSpinner } from "./CenteredSpinner";

export const AuthRoute = ({ component: Component, ...props }: any) => {
  const { loading, data, error } = useMeQuery({
    fetchPolicy: "network-only",
  });

  if (loading) return <CenteredSpinner />;
  if (error) {
    return <Redirect to="/404" />;
  }

  if (data?.me) {
    return <Route component={Component} {...props} />;
  } else {
    return <Redirect to="/login" />;
  }
};
