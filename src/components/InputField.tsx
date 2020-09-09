import React, { InputHTMLAttributes } from "react";
import { useField } from "formik";
import { TextInputField } from "evergreen-ui";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  placeholder: string;
  textarea?: boolean;
};

export const InputField: React.FC<InputFieldProps> = ({
  textarea,
  size: _,
  ...props
}) => {
  const [field, { error }] = useField(props);
  return (
    <TextInputField
      {...field}
      {...props}
      width="20vw"
      is="input"
      validationMessage={error}
    />
  );
};
