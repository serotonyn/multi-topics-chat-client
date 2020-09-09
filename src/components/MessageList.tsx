import React, { useEffect, useRef } from "react";
import { Pane, Text, Spinner, useTheme, Tooltip } from "evergreen-ui";
import {
  useMessagesQuery,
  NewMessageDocument,
  useMeQuery,
  MessagesQuery,
} from "../generated/graphql";
import { SubscribeToMoreOptions } from "@apollo/client";
import { useHistory } from "react-router-dom";

const MESSAGE_HEIGHT = 48.59;

const subscribeToNewMessages = (
  subscribeToMore: (options: SubscribeToMoreOptions) => any
) => {
  return subscribeToMore({
    document: NewMessageDocument,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev;
      const newMessage = subscriptionData.data.newMessageSubscription;

      return Object.assign({}, prev, {
        messages: [...prev.messages.messages, newMessage],
      });
    },
  });
};

const scrollToBottom = (container: any) => {
  container.scrollTop = container.scrollHeight;
};

export const MessagesList = ({ otherUserId }: any) => {
  const {
    colors: {
      background: { tint1 },
    },
  } = useTheme();
  console.log(tint1);
  let container = useRef();
  const history = useHistory();

  const {
    data: messagesData,
    error: messagesError,
    loading: messagesLoading,
    subscribeToMore,
    fetchMore,
  } = useMessagesQuery({
    variables: { limit: 20, otherUserId, offset: null },
    notifyOnNetworkStatusChange: true,
  });

  const { loading: meLoading, data: meData, error: meError } = useMeQuery();

  if (messagesError || meError) {
    history.push("/404");
  }

  const handleScroll = async () => {
    //@ts-ignore
    if (
      container.current &&
      //@ts-ignore
      container.current.scrollTop < 10 &&
      messagesData &&
      messagesData.messages &&
      //   messagesData.messages.messages.length <= 20 &&
      messagesData?.messages.hasMore
    ) {
      const { data } = await fetchMore({
        variables: {
          otherUserId,
          limit: 20,
          offset: messagesData?.messages.messages.length,
        },
        updateQuery: (previousValue, { fetchMoreResult }): MessagesQuery => {
          if (!fetchMoreResult) {
            return previousValue as MessagesQuery;
          }
          return {
            __typename: "Query",
            messages: {
              __typename: "PaginatedMessages",
              hasMore: (fetchMoreResult as MessagesQuery).messages.hasMore,
              messages: [
                ...(previousValue as MessagesQuery).messages.messages,
                ...(fetchMoreResult as MessagesQuery).messages.messages,
              ],
            },
          };
        },
      });
      //@ts-ignore
      container.current.scrollTop = data.messages.messages.length * 50;
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToNewMessages(subscribeToMore);

    //@ts-ignore
    if (
      container.current &&
      messagesData &&
      messagesData.messages &&
      messagesData.messages.messages.length <= 20
    ) {
      scrollToBottom(container.current);
    }

    return () => {
      unsubscribe();
    };
  }, [messagesData, subscribeToMore]);

  if (!meData?.me) return <div>loading</div>;

  return (
    <Pane
      //@ts-ignore
      ref={(args) => {
        container.current = args;
      }}
      //@ts-ignore
      onScroll={(args) => {
        if (messagesLoading) return;
        //@ts-ignore
        return handleScroll(args);
      }}
      overflowY="scroll"
      flexGrow={1}
      minHeight={0}
      height="100%"
    >
      <Pane display="flex" flexDirection="column-reverse">
        {meLoading || messagesLoading ? (
          <Spinner />
        ) : (
          messagesData!.messages.messages.map((message: any) => (
            <Pane
              height={MESSAGE_HEIGHT}
              key={message.id}
              alignSelf={
                message.user.id === meData?.me?.id ? "flex-end" : "flex-start"
              }
            >
              <Tooltip content={message.topic}>
                <Pane
                  backgroundColor={
                    message.user.id === meData.me?.id ? tint1 : "#579AD9"
                  }
                  margin="0.3rem"
                  paddingX=".8rem"
                  paddingY=".5rem"
                  borderRadius="1rem"
                  borderTop={`1px solid ${message.color}`}
                  borderLeft={`1px solid ${message.color}`}
                  borderRight={`1px solid ${message.color}`}
                  borderBottom={`5px solid ${message.color}`}
                >
                  {message.text && (
                    <Text
                      size={500}
                      color={
                        message.user.id === meData.me?.id ? "black" : "white"
                      }
                    >
                      {message.text}
                    </Text>
                  )}
                </Pane>
              </Tooltip>
            </Pane>
          ))
        )}
      </Pane>
    </Pane>
  );
};
