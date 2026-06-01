import { PropsWithChildren } from "react";

const InputGroup = ({ children }: PropsWithChildren) => {
  return <div className="input-group">{children}</div>;
};

export default InputGroup;
