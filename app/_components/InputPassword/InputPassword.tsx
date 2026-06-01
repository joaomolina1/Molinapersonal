import { IconButton } from "@/_design_system/Button";
import InputText from "@/_design_system/InputText";
import { InputTextProps } from "@/_design_system/InputText/InputText";
import IconUserInterfaceActionsHide from "@/_design_system/_icons/UserInterface/Actions/Hide.svg";
import IconUserInterfaceActionsShow from "@/_design_system/_icons/UserInterface/Actions/Show.svg";
import { useState } from "react";

type InputPasswordProps = Omit<
  InputTextProps,
  "type" | "onFocus" | "onBlur" | "rightIcon"
>;

const InputPassword = (props: InputPasswordProps) => {
  const [show, setShow] = useState(false);

  return (
    <InputText
      {...props}
      type={show ? "text" : "password"}
      rightIcon={
        <IconButton
          ariaLabel={show ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
          icon={
            show ? (
              <IconUserInterfaceActionsHide />
            ) : (
              <IconUserInterfaceActionsShow />
            )
          }
          onClick={() => setShow((show) => !show)}
          style={{
            fontSize: "1.25rem",
            display: props.value ? "block" : "none",
          }}
        />
      }
    />
  );
};

export default InputPassword;
