import React from "react";
import { Formik, Form } from "formik";
import { InputField } from "../components/InputField";
import { useRegisterMutation, MeQuery, MeDocument } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { Button, Pane, ChatIcon, Icon, Text } from "evergreen-ui";
import { useHistory } from "react-router-dom";

export const Register = () => {
  const history = useHistory();
  const [register] = useRegisterMutation();
  return (
    <Formik
      initialValues={{ email: "", username: "", password: "" }}
      onSubmit={async (values, { setErrors }) => {
        const response = await register({
          variables: { options: values },
          update: (cache, { data }) => {
            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: {
                __typename: "Query",
                me: data?.register.user,
              },
            });
          },
        });
        if (response.data?.register.errors) {
          setErrors(toErrorMap(response.data.register.errors));
        } else if (response.data?.register.user) {
          // worked
          history.push("/");
        }
      }}
    >
      {({ isSubmitting }) => (
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
              name="username"
              placeholder="username"
              label="Username"
            />
            <InputField name="email" placeholder="email" label="Email" />
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
              register
            </Button>
            <Text marginRight="1rem">Already have an account?</Text>
            <Button appearance="minimal">login</Button>
          </Form>
          <Icon icon={ChatIcon} color="muted" size={120} />
        </Pane>
      )}
    </Formik>
  );
};
