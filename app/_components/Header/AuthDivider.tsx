import { createBEMClasses } from "@/_utils/classname";

const { block, element } = createBEMClasses("auth-divider");

const AuthDivider = ({ text = "ou" }: { text?: string }) => (
  <div className={block()}>
    <span className={element("line")} />
    <span className={element("text")}>{text}</span>
    <span className={element("line")} />
  </div>
);

export default AuthDivider;
