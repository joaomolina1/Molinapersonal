import Prices from "@/(onboarding)/onboarding/_components/Step4/Prices";
import { TextButton } from "@/_design_system/Button";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { Pack } from "@/_models/pack";
import { useState } from "react";

export const PackPricesModal = ({ pack }: { pack: Pack }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TextButton
        text="Ver disponibilidades"
        onClick={() => setIsOpen(true)}
        size="small"
        style={{ textAlign: "left" }}
      />
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        ariaLabel="Disponibilidades do pack"
        width="medium"
        mobileHeight="almost-fullscreen"
      >
        <Stack gap="1rem">
          <TextBlock
            subtitle="Disponibilidade do pack"
            body="Esta é a disponibilidade standard deste pack. Não contempla reservas já confirmadas."
          />
          <Prices prices={pack.prices} mode="client-view" />
        </Stack>
      </Modal>
    </>
  );
};
