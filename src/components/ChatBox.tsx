import React, { useState, useEffect } from "react";
import {
  Pane,
  Text,
  IconButton,
  CrossIcon,
  Avatar,
  CornerDialog,
} from "evergreen-ui";
import { MessagesList } from "./MessageList";
import { MessageInput } from "./MessageInput";

export const ChatBox = ({ otherUser, isShown, setIsShown }: any) => {
  useEffect(() => {
    setTimeout(() => {
      setIsShown(true);
    }, 1000);
  }, []);

  return (
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
      <Pane
        height={520}
        // width={400}
        // border="default"
        // position="absolute"
        // bottom={0}
        // right={20}
        // background="white"
        // elevation={4}
      >
        <Pane display="flex" flexDirection="column" height="100%" width="100%">
          {/* <Pane
            backgroundColor="rgb(56, 160, 101)"
            height={40}
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            paddingX=".4rem"
          >
            <Pane display="flex" alignItems="center">
              <Avatar name={otherUser.username} size={25} marginX="0.5rem" />
              <Text color="white">{otherUser.username}</Text>
            </Pane>
            <IconButton icon={CrossIcon} height={22} />
          </Pane> */}

          <MessagesList otherUserId={+otherUser.id} />

          <br />

          <MessageInput otherUserId={+otherUser.id} />
        </Pane>
      </Pane>
    </CornerDialog>
  );
};
