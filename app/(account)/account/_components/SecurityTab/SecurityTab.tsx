import TextBlock from "@/_design_system/TextBlock";
import { createBEMClasses } from "@/_utils/classname";
import ChangePassword from "./ChangePassword";

const { block } = createBEMClasses("account-security-tab");

const SecurityTab = () => {
  return (
    <div className={block()}>
      <div className="hide-mobile-large">
        <TextBlock title="Segurança" />
      </div>
      <div className="hide-desktop-large">
        <TextBlock subtitle="Segurança" />
      </div>
      <ChangePassword />
    </div>
  );
};

export default SecurityTab;
