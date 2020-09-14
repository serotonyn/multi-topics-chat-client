import React from "react";
import { Formik, Form } from "formik";
import { InputField } from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { Button, Pane, ChatIcon, Icon, Text } from "evergreen-ui";
import { useHistory, Link } from "react-router-dom";

export const Login = () => {
  const history = useHistory();
  const [login] = useLoginMutation();

  return (
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
      <Pane>
        <Formik
          initialValues={{ usernameOrEmail: "", password: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await login({
              variables: values,
            });

            if (response.data?.login.errors) {
              setErrors(toErrorMap(response.data.login.errors));
            } else if (response.data?.login.ok) {
              if (
                !response.data?.login.token ||
                !response.data?.login.refreshToken
              )
                return;

              localStorage.setItem("token", response.data.login.token);
              localStorage.setItem(
                "refreshToken",
                response.data.login.refreshToken
              );
              history.push("/");
            }
          }}
        >
          {({ isSubmitting }: { isSubmitting: boolean }) => (
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
            </Form>
          )}
        </Formik>
        <Text marginRight="1rem">Don't have an account yet?</Text>
        <Link to="/register" style={{ textDecoration: "none" }}>
          <Button appearance="minimal">register</Button>
        </Link>
      </Pane>
      <Pane>
        <Icon icon={ChatIcon} color="muted" size={120} />
      </Pane>
    </Pane>
  );
};
