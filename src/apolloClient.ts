import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
  ApolloLink,
  concat,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext({
    headers: {
      "x-token": localStorage.getItem("token"),
      "x-refresh-token": localStorage.getItem("refreshToken"),
    },
  });

  return forward(operation);
});

const httpLink = () =>
  createHttpLink({
    uri: process.env.REACT_APP_PUBLIC_API_URL as string,
    headers: {
      "x-token":
        (console.log(localStorage.getItem("token")),
        localStorage.getItem("token")),
      "x-refresh-token": localStorage.getItem("refreshToken"),
    },
  });

const wsLink = new WebSocketLink({
  uri: process.env.REACT_APP_WS_API_URL as string,
  options: {
    reconnect: true,
    lazy: true,
    connectionParams: () => ({
      token: localStorage.getItem("token"),
      refreshToken: localStorage.getItem("refreshToken"),
    }),
  },
});

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
export const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink()
);

export const apolloClient = new ApolloClient({
  link: concat(authMiddleware, splitLink),
  cache: new InMemoryCache(),
});
