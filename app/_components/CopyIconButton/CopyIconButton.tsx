import IconUserInterfaceActionsCopy from "@/_design_system/_icons/UserInterface/Actions/Copy.svg";
import { IconButton } from "@/_design_system/Button";
import { useShowToast } from "@/_design_system/Toast";

const CopyIconButton = ({ text }: { text: string }) => {
  const showToast = useShowToast();

  return (
    <IconButton
      ariaLabel="Copiar"
      showTooltip={false}
      icon={<IconUserInterfaceActionsCopy />}
      style={{ fontSize: "1rem" }}
      onClick={() => {
        navigator.clipboard.writeText(text);
        showToast({ text: `"${text}" copiado` });
      }}
    />
  );
};

export default CopyIconButton;
