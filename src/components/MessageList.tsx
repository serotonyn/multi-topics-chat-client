import React, { useEffect, useRef, useState } from "react";
import { Pane, Text, Spinner, useTheme, Tooltip, Alert } from "evergreen-ui";
import {
  MessagesQuery,
  NewMessageDocument,
  useMessagesQuery,
} from "../generated/graphql";
import beep from "../utils/audioBase64";
import Linkify from "react-linkify";

export const scrollToBottom = (container: any) => {
  container.scrollTop = container.scrollHeight;
};

export const MessagesList = ({
  meId,
  otherUserId,
  isNewMessageCreated,
  setIsNewMessageCreated,
}: any) => {
  const {
    colors: {
      background: { tint1 },
    },
  } = useTheme();
  const container = useRef<HTMLDivElement>();
  const [isNewMessagesAlertShown, setIsNewMessagesAlertShown] = useState(false);

  const { data, error, loading, subscribeToMore, fetchMore } = useMessagesQuery(
    {
      variables: { limit: 20, otherUserId, cursor: null },
      notifyOnNetworkStatusChange: true,
    }
  );

  useEffect(() => {
    if (!data) return;

    if (
      isNewMessageCreated &&
      container?.current!.scrollHeight -
        container?.current!.scrollTop -
        container?.current!.clientHeight <
        500
    ) {
      scrollToBottom(container.current);
      setIsNewMessageCreated(false);
    }

    if (container.current && data.messages.messages.length <= 20) {
      scrollToBottom(container.current);
    }

    if (
      container?.current!.scrollHeight -
        container?.current!.scrollTop -
        container?.current!.clientHeight <
      500
    ) {
      scrollToBottom(container.current);
    }

    const unsubscribe = subscribeToMore({
      document: NewMessageDocument,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        //@ts-ignore
        const newMessage = subscriptionData.data.newMessageSubscription;

        new Audio(beep).play();

        if (
          container?.current!.scrollHeight -
            container?.current!.scrollTop -
            container?.current!.clientHeight >
          500
        ) {
          setIsNewMessagesAlertShown(true);
        }

        return Object.assign({}, prev, {
          messages: {
            messages: [newMessage, ...prev.messages.messages],
            __typename: "PaginatedMessages",
            hasMore: data?.messages.hasMore,
          },
        });
      },
    });

    return () => {
      unsubscribe();
    };
  }, [data, subscribeToMore, isNewMessageCreated, setIsNewMessageCreated]);

  const handleScroll = async () => {
    if (
      container.current &&
      container.current.scrollTop < 10 &&
      data?.messages.hasMore
    ) {
      const { data: fetchMoreData } = await fetchMore({
        variables: {
          otherUserId,
          limit: 20,
          cursor:
            data.messages.messages[data.messages.messages.length - 1].createdAt,
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
      container.current.scrollTop = fetchMoreData.messages.messages.length * 50;
    } else if (
      // TODO hold this in a variable
      container?.current!.scrollHeight -
        container?.current!.scrollTop -
        container?.current!.clientHeight <
        50 &&
      isNewMessagesAlertShown
    ) {
      setIsNewMessagesAlertShown(false);
    }
  };

  if (loading) return <div>loading</div>;
  if (error) return <div>`Error!`</div>;
  if (!data) return <div>nodata</div>;
  return (
    <Pane
      ref={(args: HTMLDivElement) => {
        container.current = args;
      }}
      onScroll={() => {
        return handleScroll();
      }}
      height="77vh"
      overflowY={loading ? "initial" : "scroll"}
      style={{
        overflowWrap: "anywhere",
      }}
    >
      <Pane display="flex" flexDirection="column-reverse" alignItems="center">
        {loading ? (
          <Spinner />
        ) : (
          data!.messages.messages.map((message: any) => (
            <Pane
              // height={MESSAGE_HEIGHT}
              key={message.id}
              alignSelf={message.user.id === meId ? "flex-end" : "flex-start"}
            >
              <Tooltip content={message.topic}>
                <Pane
                  backgroundColor={message.user.id === meId ? tint1 : "#579AD9"}
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
                      color={message.user.id === meId ? "black" : "white"}
                      whiteSpace="pre-line"
                    >
                      <Linkify
                        componentDecorator={(
                          decoratedHref,
                          decoratedText,
                          key
                        ) => (
                          <a target="blank" href={decoratedHref} key={key}>
                            {decoratedText}
                          </a>
                        )}
                      >
                        {message.text}
                      </Linkify>
                    </Text>
                  )}
                </Pane>
              </Tooltip>
            </Pane>
          ))
        )}
      </Pane>

      {isNewMessagesAlertShown && (
        <Alert
          intent="none"
          title="There are new messages at the bottom"
          width="320px"
          position="absolute"
          bottom="16vh"
          left="30px"
          opacity="0.9"
          onClick={() => scrollToBottom(container.current)}
          style={{
            cursor: "pointer",
          }}
        />
      )}
    </Pane>
  );
};
