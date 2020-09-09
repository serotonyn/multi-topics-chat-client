import React, { useState, useEffect } from "react";
import { useUserQuery } from "../generated/graphql";
import {
  CornerDialog,
  Button,
  Text,
  Heading,
  Pane,
  InfoSignIcon,
} from "evergreen-ui";
import { useParams, Redirect } from "react-router-dom";
import { ChatBox } from "../components/ChatBox";
import { CenteredSpinner } from "../components/CenteredSpinner";

export const Chat = () => {
  const [isShown, setIsShown] = useState(false);
  const { id: otherUserId } = useParams();

  const { data, loading } = useUserQuery({
    variables: { userId: otherUserId },
  });

  return loading ? (
    <CenteredSpinner />
  ) : data ? (
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
      <Pane width="60vw">
        <Text size={500} is="p" marginBottom="2rem">
          Good to{" "}
          <span role="img" aria-label="asd">
            👀
          </span>{" "}
          you here, here are some things you should know :
        </Text>
        <Heading size={600} marginBottom="2rem">
          <InfoSignIcon color="info" marginRight={16} />
          You can create new topics (or choose existing ones), by clicking on
          the button next to the message input field.
          <Button appearance="minimal">general</Button>
        </Heading>
        <Heading size={600} marginBottom="2rem">
          <InfoSignIcon color="info" marginRight={16} />
          Once the pop-up opens, you can type text to filter existing topics.
          Choose your topic by clicking on it.
        </Heading>
        <Heading size={600}>
          <InfoSignIcon color="info" marginRight={16} />
          if you type something that doesn't exist yet, this means you'll be
          creating a new one by clicking on it.
        </Heading>
        <Button
          marginTop={24}
          appearance="primary"
          onClick={() => setIsShown(true)}
          visibility={isShown ? "hidden" : "initial"}
        >
          Show Chat Box
        </Button>
      </Pane>

      <ChatBox
        isShown={isShown}
        setIsShown={setIsShown}
        otherUser={data?.user.user}
      />
    </Pane>
  ) : (
    <Redirect to="/404" />
  );
};
