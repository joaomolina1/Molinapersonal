import Button from "@/_design_system/Button";
import Modal from "@/_design_system/Modal";
import { Pack } from "@/_models/pack";
import { createBEMClasses } from "@/_utils/classname";
import { useState } from "react";
import Prices from "../../Step4/Prices";
import Stack from "@/_design_system/Stack";

const { element: packCardElement } = createBEMClasses("onboarding-pack-card");

const PackCardAdminModal = ({ pack }: { pack: Pack }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Ver preços"
        onClick={() => setIsOpen(true)}
        type="secondary"
        className={packCardElement("admin")}
      />
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        ariaLabel="Detalhes do pack"
        width="xx-large"
      >
        <Stack gap="1rem">
          <h3>Detalhes do pack</h3>
          <ul>
            <li>Duração mínima: {pack.minTime?.number}h</li>
            <li>Duração máxima: {pack.maxTime?.number}h</li>
            <li>Política de cancelamento: {pack.cancellationPeriod}</li>
          </ul>
          <h5>Preçário:</h5>
          <Prices prices={pack.prices} mode="admin-view" />
        </Stack>
      </Modal>
    </>
  );
};

export default PackCardAdminModal;
