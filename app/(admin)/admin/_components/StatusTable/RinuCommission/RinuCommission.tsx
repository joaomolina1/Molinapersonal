import IconUserInterfaceActionsEdit from "@/_design_system/_icons/UserInterface/Actions/Edit.svg";
import Button, { IconButton } from "@/_design_system/Button";
import InputNumber from "@/_design_system/InputNumber";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { DashboardItem } from "@/_models/dashboard";
import { useUpdateVenue } from "@/_models/venue";
import { formatPercentage } from "@/_utils/number";
import { useState } from "react";

const RinuCommission = ({ item }: { item: DashboardItem }) => {
  const [isOpenEdit, setIsOpenEdit] = useState(false);

  if (item.type !== "venue") {
    return null;
  }

  return (
    <Stack row gap="0.625rem">
      <span>
        {item.commission !== undefined
          ? formatPercentage(item.commission / 100)
          : "-"}
      </span>
      <IconButton
        style={{ fontSize: "1rem" }}
        icon={<IconUserInterfaceActionsEdit />}
        ariaLabel="Alterar"
        showTooltip={false}
        onClick={() => setIsOpenEdit(true)}
      />
      <EditCommissionModal
        item={item}
        isOpen={isOpenEdit}
        setIsOpen={setIsOpenEdit}
      />
    </Stack>
  );
};

const EditCommissionModal = ({
  item,
  isOpen,
  setIsOpen,
}: {
  item: DashboardItem;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [commission, setCommission] = useState<number | undefined>(
    item.commission,
  );
  const [showError, setShowError] = useState(false);

  const { mutateAsync: updateVenue, isPending: isPendingUpdateVenue } =
    useUpdateVenue();

  const commissionIsInvalid =
    commission === undefined || commission < 0 || commission > 100;

  const save = async () => {
    setShowError(true);

    if (commissionIsInvalid) {
      return;
    }

    await updateVenue({ id: item.id, body: { commision: commission ?? 0 } });
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      ariaLabel="Editar a comissão RINU"
      width="small"
    >
      <Stack gap="2.5rem">
        <Stack gap="1rem">
          <TextBlock subtitle="Alterar a comissão RINU" />
          <InputNumber
            label="Comissão RINU"
            value={commission}
            onChange={setCommission}
            measure="%"
            allowNegative={false}
            invalid={showError && commissionIsInvalid}
          />
        </Stack>
        <Stack gap="1rem">
          <Button
            label="Guardar"
            type="primary"
            onClick={save}
            loading={isPendingUpdateVenue}
          />
          <Button
            label="Cancelar"
            type="secondary"
            onClick={() => setIsOpen(false)}
          />
        </Stack>
      </Stack>
    </Modal>
  );
};

export default RinuCommission;
