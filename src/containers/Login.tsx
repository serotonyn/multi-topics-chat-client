import React from "react";
import { Formik, Form } from "formik";
import { InputField } from "../components/InputField";
import { useLoginMutation, MeQuery, MeDocument } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { Button, Pane, ChatIcon, Icon, Text } from "evergreen-ui";
import { useHistory } from "react-router-dom";

export const Login = () => {
  const history = useHistory();
  const [login] = useLoginMutation();
  return (
    <Formik
      initialValues={{ usernameOrEmail: "", password: "" }}
      onSubmit={async (values, { setErrors }) => {
        const response = await login({
          variables: values,
          update: (cache, { data }) => {
            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: {
                __typename: "Query",
                me: data?.login.user,
              },
            });
            cache.evict({ fieldName: "posts:{}" });
          },
        });
        if (response.data?.login.errors) {
          setErrors(toErrorMap(response.data.login.errors));
        } else if (response.data?.login.user) {
          history.push("/");
        }
      }}
    >
      {({ isSubmitting }: { isSubmitting: boolean }) => (
        <Pane
          border="default"
          marginTop="4rem"
          paddingY="4rem"
          paddingX="6rem"
          marginX="10rem"
          display="flex"
          alignItems="center"
          justifyContent="space-around"
        >
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="username or email"
              label="Username or Email"
            />
            <InputField
              name="password"
              placeholder="password"
              label="Password"
              type="password"
            />
            <Button
              display="block"
              marginBottom="1rem"
              type="submit"
              isLoading={isSubmitting}
            >
              login
            </Button>
            <Text marginRight="1rem">Don't have an account yet?</Text>
            <Button appearance="minimal">register</Button>
          </Form>
          <Icon icon={ChatIcon} color="muted" size={120} />
        </Pane>
      )}
    </Formik>
  );
};
