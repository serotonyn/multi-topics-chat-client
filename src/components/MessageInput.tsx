import React, { useState, useEffect } from "react";
import {
  SelectMenu,
  Button,
  Position,
  DirectionRightIcon,
  TextInput,
  Pane,
  IconButton,
} from "evergreen-ui";
import { intToRGB, createIconB64 } from "../utils/generateTopicColor";
import {
  useCreateMessageMutation,
  useTopicsQuery,
  NewTopicDocument,
} from "../generated/graphql";
import { SubscribeToMoreOptions } from "@apollo/client";

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

export const MessageInput = ({ otherUserId }: { otherUserId: number }) => {
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

  const [createMessage] = useCreateMessageMutation();
  //TODO handle useTopicsQuery error
  const { data: topicsData, subscribeToMore } = useTopicsQuery({
    variables: { otherUserId },
  });

  const handleFilter = (filterValue: any) => {
    // TODO better handle max length
    // if (filterValue.length > 4) return;
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
  };

  const handleSubmit = () => {
    if (!inputValue) return;
    const selectedOption = options.find((o) => o.label === selectedTopic.label);
    createMessage({
      variables: {
        text: inputValue,
        topic: selectedTopic.label,
        color: selectedOption ? selectedOption.color : "#fff",
        otherUserId,
        isNewTopic: !topicsData?.topics?.find(
          (t) => t.label === selectedTopic.label
        ),
      },
      refetchQueries: ["Messages"],
    });
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
    <Pane display="flex" alignItems="flex-end" width="100%" padding=".5rem">
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
        <Button appearance="minimal" /* width={90}  */ /* overflowX="hidden" */>
          {selectedTopic.label || "Topic"}
        </Button>
      </SelectMenu>
      <TextInput
        margin="0"
        width="100%"
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
          e.keyCode === 13 && handleSubmit()
        }
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setInputValue(e.target.value)
        }
        value={inputValue}
        {...(selectedTopic.label !== "general"
          ? {
              boxShadow: `inset 0 0 0 1px ${selectedTopic.color}, inset 0 1px 2px ${selectedTopic.color} !important`,
            }
          : {})}
      />
      <Pane display="flex" alignItems="flex-end">
        <IconButton appearance="minimal" icon={DirectionRightIcon} />
      </Pane>
    </Pane>
  );
};
