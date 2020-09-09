import React from "react";
import { Icon, Pane, ErrorIcon, Button, Heading } from "evergreen-ui";
import { Link } from "react-router-dom";

export const Error404 = () => {
  return (
    <Pane
      border="default"
      marginTop="4rem"
      paddingY="4rem"
      paddingX="6rem"
      marginX="10rem"
      display="flex"
      alignItems="center"
      justifyContent="space-around"
      flexDirection="column"
    >
      <Icon marginBottom="1rem" icon={ErrorIcon} color="muted" size={120} />
      <Heading size={600} marginBottom="1rem">
        Sorry, something went wrong.
      </Heading>
      <Link to="/">
        <Button>Go Back</Button>
      </Link>
    </Pane>
  );
};
