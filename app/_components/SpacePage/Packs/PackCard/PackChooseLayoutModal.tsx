import { PackCapacity } from "@/_constants/pack/capacities";
import Button from "@/_design_system/Button";
import Card from "@/_design_system/Card";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { Pack } from "@/_models/pack";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useState } from "react";

const PackChooseLayoutModal = ({
  capacities,
  isOpen,
  setIsOpen,
  onContinue,
  isPending,
}: {
  capacities: Pack["formattedCapacities"];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onContinue: (layout: PackCapacity["layout"]) => void | Promise<void>;
  isPending: boolean;
}) => {
  const isMobile = useMediaQuery("large");

  const [chosenLayout, setChosenLayout] = useState(capacities[0].id);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      width="large"
      ariaLabel="Escolha a disposição"
      showCloseButton={false}
    >
      <Stack gap={isMobile ? "1.5rem" : "2rem"}>
        <Stack gap={isMobile ? "1.5rem" : "1rem"}>
          <TextBlock subtitle="Escolha a disposição do espaço" />
          <div className="card-group">
            {capacities.map((layout) => (
              <Card
                key={layout.id}
                type="radio"
                radioGroupName="pack-layout"
                variant="large-icon"
                icon={layout.icon}
                text={`${layout.text} · ${layout.people} ${
                  layout.people === 1 ? "pessoa" : "pessoas"
                }`}
                microcopy={layout.microcopy}
                checked={chosenLayout === layout.id}
                onChange={() => {
                  setChosenLayout(layout.id);
                }}
              />
            ))}
          </div>
        </Stack>
        <Stack
          row={!isMobile}
          gap={isMobile ? "0.5rem" : "1rem"}
          justifyContent={isMobile ? undefined : "flex-end"}
          alignItems={isMobile ? "stretch" : undefined}
        >
          <Button
            label="Continuar"
            type="primary"
            style={isMobile ? undefined : { order: 1 }}
            onClick={async () => {
              await onContinue(chosenLayout);
              setIsOpen(false);
            }}
            loading={isPending}
          />
          <Button
            label="Cancelar"
            type="link"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          />
        </Stack>
      </Stack>
    </Modal>
  );
};

export default PackChooseLayoutModal;
