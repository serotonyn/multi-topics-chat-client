import React, { useState, useEffect } from "react";
import {
  Pane,
  Text,
  IconButton,
  CrossIcon,
  Avatar,
  CornerDialog,
  Spinner,
} from "evergreen-ui";
import { MessagesList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useMeQuery } from "../generated/graphql";
import { Redirect } from "react-router-dom";

export const ChatBox = ({ otherUser, isShown, setIsShown }: any) => {
  const [isNewMessageCreated, setIsNewMessageCreated] = useState(false);
  useEffect(() => {
    setIsNewMessageCreated(false);
    setTimeout(() => {
      setIsShown(true);
    }, 1000);
  }, [setIsShown]);

  const onCreateMessageCompleted = () => {
    setIsNewMessageCreated(true);
  };

  const { loading: meLoading, data: meData, error: meError } = useMeQuery();

  if (meError) return <Redirect to="/404" />;

  return meLoading ? (
    <Spinner />
  ) : (
    <CornerDialog
      title={
        <>
          <Pane display="flex" flexDirection="column" alignItems="center">
            <Avatar name={otherUser.username} size={25} marginX="0.5rem" />
            <Text>{otherUser.username}</Text>
          </Pane>
          <IconButton
            appearance="minimal"
            icon={CrossIcon}
            height={40}
            position="absolute"
            top={0}
            right={0}
            onClick={() => setIsShown(false)}
          />
        </>
      }
      hasFooter={false}
      isShown={isShown}
      hasClose={false}
    >
      <Pane height={520}>
        <Pane display="flex" flexDirection="column" height="100%" width="100%">
          <MessagesList
            otherUserId={+otherUser.id}
            isNewMessageCreated={isNewMessageCreated}
            me={meData?.me}
          />

          <br />

          <MessageInput
            otherUserId={+otherUser.id}
            onCreateMessageCompleted={onCreateMessageCompleted}
            me={meData?.me}
          />
        </Pane>
      </Pane>
    </CornerDialog>
  );
};
