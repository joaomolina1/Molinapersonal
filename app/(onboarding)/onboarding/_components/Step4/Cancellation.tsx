import PackCancellationLabel from "@/_components/PackCancellationLabel";
import Button, { TextButton } from "@/_design_system/Button";
import Card from "@/_design_system/Card";
import InputNumber from "@/_design_system/InputNumber";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfacePaymentCard from "@/_design_system/_icons/UserInterface/Payment/Card.svg";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { useState } from "react";

const Cancellation = ({
  cancellation,
  setCancellation,
  error,
}: {
  cancellation?: string;
  setCancellation?: (cancellation: string) => void;
  error?: string;
}) => {
  const [isOpenCustomModal, setIsOpenCustomModal] = useState(false);

  const isCurrentCancellationCustom =
    !!cancellation &&
    !DEFAULT_CANCELLATIONS.find(({ value }) => value === cancellation);

  const [isCustom, setIsCustom] = useState(isCurrentCancellationCustom);

  const [customCancellation, setCustomCancellation] = useState(
    isCurrentCancellationCustom ? cancellation : undefined,
  );

  const handleSaveCustomCancellation = (newCustomCancellation: string) => {
    setCustomCancellation(newCustomCancellation);
    setIsOpenCustomModal(false);

    if (isCustom) {
      setCancellation?.(newCustomCancellation);
    }
  };

  const handleCancelCustomCancellation = () => {
    setIsOpenCustomModal(false);

    if (!isCurrentCancellationCustom) {
      setIsCustom(false);
    }
  };

  return (
    <Stack gap="16px" alignItems="flex-start">
      <div className="hide-desktop-large">
        <TextBlock
          label="Qual a sua política de cancelamento gratuito?"
          body={<CancellationBody />}
        />
      </div>
      <div className="hide-mobile-large">
        <TextBlock
          subtitle="Qual a sua política de cancelamento gratuito?"
          body={<CancellationBody />}
        />
      </div>
      {error && <InputError error={error} />}
      <div
        className="card-group"
        aria-label="Qual a sua política de cancelamento gratuito?"
      >
        {DEFAULT_CANCELLATIONS.map((defaultCancellation) => (
          <Card
            key={defaultCancellation.value}
            type="radio"
            radioGroupName="pack-cancellation"
            icon={<IconUserInterfacePaymentCard />}
            text={defaultCancellation.text}
            microcopy={
              <PackCancellationLabel
                cancellation={defaultCancellation.value}
                withBold
              />
            }
            checked={!isCustom && cancellation === defaultCancellation.value}
            onChange={() => {
              setIsCustom(false);
              setCancellation?.(defaultCancellation.value);
            }}
          />
        ))}
        <Card
          type="radio"
          radioGroupName="pack-cancellation-custom"
          icon={<IconUserInterfacePaymentCard />}
          text="Personalizado"
          microcopy={
            customCancellation ? (
              <PackCancellationLabel
                cancellation={customCancellation}
                withBold
              />
            ) : (
              "Indique até quantos dias oferece reembolso total"
            )
          }
          checked={isCustom}
          onChange={() => {
            setIsCustom(true);

            if (customCancellation) {
              setCancellation?.(customCancellation);
            } else {
              setIsOpenCustomModal(true);
            }
          }}
        >
          {!!customCancellation && (
            <TextButton
              text="Editar"
              size="x-small"
              onClick={() => setIsOpenCustomModal(true)}
            />
          )}
        </Card>
      </div>
      <Modal
        isOpen={isOpenCustomModal}
        onOpenChange={handleCancelCustomCancellation}
        ariaLabel="Personalizar política de cancelamento"
        width="medium"
      >
        <CustomCancellationModal
          cancellation={customCancellation}
          onSave={handleSaveCustomCancellation}
          onCancel={handleCancelCustomCancellation}
        />
      </Modal>
    </Stack>
  );
};

const DEFAULT_CANCELLATIONS = [
  {
    text: "Muito flexível",
    value: "24h",
  },
  {
    text: "Flexível",
    value: "7d",
  },
  {
    text: "Standard 30 dias",
    value: "30d",
  },
  {
    text: "Standard 60 dias",
    value: "60d",
  },
];

const CancellationBody = () => (
  <>
    Um cliente que reserve este pack irá pagar 20% no momento da adjudicação. O
    restante montante pagará na data que selecionar nas opções abaixo. Antes
    dessa data o cancelamento por parte do cliente é gratuito, depois dessa data
    o valor cobrado não é reembolsável.
  </>
);

const CustomCancellationModal = ({
  cancellation,
  onSave,
  onCancel,
}: {
  cancellation?: string;
  onSave: (cancellation: string) => void;
  onCancel: () => void;
}) => {
  const [value, setValue] = useState(
    cancellation ? parseInt(cancellation.slice(0, -1)) : undefined,
  );

  let error: string = "";

  if (!!value && value > 120) {
    error = "Máximo de 120 dias";
  }

  const handleAdd = () => {
    onSave(`${value}d`);
  };

  return (
    <Stack gap="2.5rem">
      <TextBlock
        subtitle="Personalizar política de cancelamento"
        body="Defina o período mínimo para o cancelamento não ser reembolsável"
      />
      <Stack gap="1rem">
        <StackHalfHalf>
          <InputNumber
            value={value}
            onChange={setValue}
            measure="dias"
            label="Mínimo"
            allowNegative={false}
            decimalScale={0}
            error={error}
          />
          <div />
        </StackHalfHalf>
        <Stack row justifyContent="flex-end" gap="1rem">
          <Button label="Cancelar" type="link" onClick={onCancel} />
          <Button
            label="Adicionar"
            type="primary"
            disabled={!value || !!error}
            onClick={handleAdd}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Cancellation;
