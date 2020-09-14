import React, { useState, useEffect, useRef } from "react";
import { SelectMenu, Button, Position, Pane } from "evergreen-ui";
import { intToRGB, createIconB64 } from "../utils/generateTopicColor";
import {
  useCreateMessageMutation,
  useTopicsQuery,
  NewTopicDocument,
} from "../generated/graphql";
import { SubscribeToMoreOptions } from "@apollo/client";
import Textarea from "react-expanding-textarea";

const subscribeToNewTopics = (
  subscribeToMore: (options: SubscribeToMoreOptions) => any
) => {
  return subscribeToMore({
    document: NewTopicDocument,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev;
      const newTopic = subscriptionData.data.newTopicSubscription;

      return Object.assign({}, prev, {
        topics: [...prev.topics, { ...newTopic, __typename: "Topic" }],
      });
    },
  });
};

export const MessageInput = ({
  otherUserId,
  onCreateMessageCompleted,
  meId,
}: {
  otherUserId: number;
  onCreateMessageCompleted: any;
  meId: any;
}) => {
  const textarea = useRef<HTMLTextAreaElement>();
  const [options, setOptions] = useState<
    { label: string; icon: string; color: string }[]
  >([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedTopic, setSelectedTopic] = useState({
    label: "general",
    value: "general",
    color: "#fff",
  });
  const [first, setFirst] = useState(true);

  const [createMessage] = useCreateMessageMutation({
    // onCompleted: onCreateMessageCompleted,
    onError: (...args) => {
      console.log(args);
    },
  });

  //TODO handle useTopicsQuery error
  const { data: topicsData, subscribeToMore } = useTopicsQuery({
    variables: { otherUserId },
  });

  const handleFilter = (filterValue: any) => {
    // TODO better handle max length
    if (filterValue.length > 30) {
      return;
    }
    if (!options.includes(filterValue)) {
      if (first) {
        setOptions((opts) => [
          ...opts,
          { label: filterValue, color: "", icon: "" },
        ]);
        setFirst(false);
      } else {
        setOptions((opts) => [
          ...opts.slice(0, -1),
          { label: filterValue, color: "", icon: "" },
        ]);
      }
    }
  };
  const handleSelectedTopic = (selectedTopicLabel: string) => {
    if (selectedTopicLabel === "general") {
      setSelectedTopic({
        label: "general",
        value: "general",
        color: "#fff",
      });
    } else {
      const color = "#" + intToRGB(selectedTopicLabel);
      const icon = createIconB64(color);
      const newTopic = {
        label: selectedTopicLabel,
        value: selectedTopicLabel,
        color,
        icon,
      };
      setOptions(
        options.map((o) => (o.label === selectedTopicLabel ? newTopic : o))
      );
      setSelectedTopic(newTopic);
    }
    textarea.current?.focus();
  };

  const handleSubmit = async () => {
    if (!inputValue.length || inputValue.length > 3000) return;
    const trimmed = inputValue.trim();
    const selectedOption = options.find((o) => o.label === selectedTopic.label);
    await createMessage({
      variables: {
        text: trimmed,
        topic: selectedTopic.label,
        color: selectedOption ? selectedOption.color : "#fff",
        otherUserId,
        isNewTopic: !topicsData?.topics?.find(
          (t) => t.label === selectedTopic.label
        ),
      },
      optimisticResponse: {
        __typename: "Mutation",
        createMessage: {
          __typename: "Message",
          id: 0,
          createdAt: "",
          updatedAt: "",
          user: {
            id: meId,
          },
          otherUser: {
            id: otherUserId,
          },
          text: trimmed,
          topic: selectedTopic.label,
          color: selectedOption ? selectedOption.color : "#fff",
        },
      },
      update: (cache, { data }) => {
        cache.modify({
          fields: {
            messages: (prev) => {
              if (!data?.createMessage) return prev;
              const newMessage = data.createMessage;

              return Object.assign({}, prev, {
                messages: [newMessage, ...prev.messages],
              });
            },
          },
        });
      },
    });
    onCreateMessageCompleted();
    setInputValue("");
  };

  useEffect(() => {
    if (!topicsData || !topicsData.topics || !subscribeToMore) return;
    setOptions(
      topicsData?.topics.map((o) => ({
        icon: createIconB64(o.color),
        label: o.label,
        color: o.color,
      }))
    );
    const unsubscribe = subscribeToNewTopics(subscribeToMore);
    return () => {
      unsubscribe();
    };
  }, [topicsData, subscribeToMore]);

  if (!options) return <div></div>;
  return (
    <Pane width="100%" padding=".5rem">
      <Textarea
        ref={textarea}
        maxLength={3000}
        //@ts-ignore
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        //@ts-ignore
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setInputValue(e.target.value)
        }
        value={inputValue}
        style={{
          borderRadius: 3,
          border: "none",
          flex: "1",
          resize: "none",
          outline: 0,
          boxShadow:
            selectedTopic.label === "general"
              ? `inset 0 0 0 1px rgba(67, 90, 111, 0.3)`
              : `inset 0 0 0 1px ${selectedTopic.color}`,
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 10,
          paddingBottom: 2,
          width: "calc(100% - 20px)",
          maxHeight: "10vh",
          fontFamily:
            " SF UI Text, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
        }}
      />
      <br />
      <SelectMenu
        closeOnSelect
        onFilterChange={(filterValue) => handleFilter(filterValue)}
        position={Position.TOP_LEFT}
        title="Select (or create) a topic "
        options={options.map((o) => ({
          label: o.label,
          value: o.label,
          icon: o.icon,
        }))}
        selected={selectedTopic.label}
        onSelect={(item) => handleSelectedTopic(item.value as string)}
      >
        <Pane display="flex" justifyContent="center">
          <Button appearance="minimal">{selectedTopic.label || "Topic"}</Button>
        </Pane>
      </SelectMenu>
    </Pane>
  );
};
