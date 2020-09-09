import React from "react";
import { Pane, Spinner } from "evergreen-ui";

export const CenteredSpinner = () => {
  return (
    <Pane height="100vh" style={{ display: "grid", placeItems: "center" }}>
      <Spinner />
    </Pane>
  );
};
