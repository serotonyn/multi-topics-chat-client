import React, { useState } from "react";
import { useUsersQuery } from "../generated/graphql";
import { Pane, Avatar, Heading, Card, Text, InfoSignIcon } from "evergreen-ui";
import { Link, useHistory, Redirect } from "react-router-dom";
import { CenteredSpinner } from "../components/CenteredSpinner";

interface indexProps {}

export const App: React.FC<indexProps> = () => {
  const history = useHistory();
  const [isCardHovered, setIsCardHovered] = useState(false);
  const { data, error, loading } = useUsersQuery();

  if (error) {
    history.push("/404");
  }

  if (!loading && !data) return <div>sasd</div>;

  return (
    <>
      {loading ? (
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
          <Pane display="flex" alignItems="center" marginBottom="2rem">
            <InfoSignIcon color="info" marginRight={16} />
            <Text size={600}>Select a user to start chatting.</Text>
          </Pane>
          <Pane display="flex" flexDirection="column">
            {data!.users.map((u) => (
              <Link key={u.id} to={`/chat/${u.id}`}>
                <Card
                  display="flex"
                  onMouseOver={() => setIsCardHovered(true)}
                  onMouseOut={() => setIsCardHovered(false)}
                  style={{
                    cursor: isCardHovered ? "pointer" : "initial",
                  }}
                  alignItems="center"
                  marginBottom="1rem"
                >
                  <Avatar name={u.username} size={40} marginRight="1rem" />
                  <Heading>{u.username}</Heading>
                </Card>
              </Link>
            ))}
          </Pane>
        </Pane>
      ) : (
        <Redirect to="/404" />
      )}
    </>
  );
};
