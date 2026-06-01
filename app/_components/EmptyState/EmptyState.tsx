import Button, { ButtonProps } from "@/_design_system/Button";
import TextBlock, { TextBlockProps } from "@/_design_system/TextBlock";
import IconUserInterfaceActionsAdd from "@/_design_system/_icons/UserInterface/Actions/Add.svg";
import IllustrationNoData from "@/_design_system/_illustrations/NoData.svg";
import { createBEMClasses } from "@/_utils/classname";

const { block, element } = createBEMClasses("list-empty-state");

const EmptyState = ({
  text,
  action,
  withBorder,
}: {
  text: TextBlockProps;
  action?: ButtonProps;
  withBorder?: boolean;
}) => {
  return (
    <div className={block({ "with-border": withBorder })}>
      <div className={element("content")}>
        <IllustrationNoData />
        <TextBlock {...text} />
        {action && (
          <Button
            leftIcon={<IconUserInterfaceActionsAdd />}
            type="secondary"
            {...action}
          />
        )}
      </div>
    </div>
  );
};

export default EmptyState;
