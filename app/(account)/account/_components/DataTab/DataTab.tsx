import InputText from "@/_design_system/InputText";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { useSession } from "@/_services/session";
import { createBEMClasses } from "@/_utils/classname";

const { block, element } = createBEMClasses("account-data-tab");

const DataTab = () => {
  const [session] = useSession();

  return (
    <div className={block()}>
      <div className="hide-mobile-large">
        <TextBlock title="Os meus dados pessoais" />
      </div>
      <div className="hide-desktop-large">
        <TextBlock subtitle="Os meus dados pessoais" />
      </div>
      <div className={element("content")}>
        <Stack gap="1rem">
          <InputText label="Nome" value={session?.name} disabled />
          <InputText label="Email" value={session?.email} disabled />
        </Stack>
      </div>
    </div>
  );
};

export default DataTab;
