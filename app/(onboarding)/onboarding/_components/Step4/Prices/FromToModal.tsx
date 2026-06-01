import Button from "@/_design_system/Button";
import InputDate from "@/_design_system/InputDate";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import TextBlock from "@/_design_system/TextBlock";
import { useState } from "react";
import { CalendarDate, parseDate, today } from "@internationalized/date";
import { PriceDraft } from "./Prices";

const FromToModal = ({
  isOpen,
  setIsOpen,
  initialPrice,
  onAddPrice,
  onEditPrice,
  onCancel,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialPrice?: PriceDraft;
  onAddPrice: (from: string, to: string) => void;
  onEditPrice: (from: string, to: string) => void;
  onCancel: () => void;
}) => {
  const [fromDate, setFromDate] = useState<CalendarDate | null>(
    initialPrice ? parseDate(initialPrice.from.slice(0, 10)) : null,
  );
  const [toDate, setToDate] = useState<CalendarDate | null>(
    initialPrice ? parseDate(initialPrice.to.slice(0, 10)) : null,
  );
  const [fromDateError, setFromDateError] = useState("");
  const [toDateError, setToDateError] = useState("");

  const handleAdd = () => {
    setFromDateError("");
    setToDateError("");

    // This will set the date at midnight UTC (T00:00:00.000Z)
    const start = fromDate?.toDate("Etc/UTC");
    const end = toDate?.toDate("Etc/UTC");

    if (!start || isNaN(start.getDate())) {
      setFromDateError("Data inválida");
      return;
    }

    if (!end || isNaN(end.getDate())) {
      setToDateError("Data inválida");
      return;
    }
    if (end < start) {
      setToDateError("A data de fim deve ser após a data de início");
      return;
    }

    if (initialPrice) {
      onEditPrice(start.toISOString(), end.toISOString());
    } else {
      onAddPrice(start.toISOString(), end.toISOString());
    }

    setFromDate(null);
    setToDate(null);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        ariaLabel={initialPrice ? "Editar período" : "Adicionar período"}
      >
        <Stack gap="2rem">
          <Stack gap="1rem">
            <TextBlock
              subtitle={initialPrice ? "Editar período" : "Adicionar período"}
              body="Indique o período em que o preço que vai definir será válido"
            />
            <StackHalfHalf>
              <InputDate
                label="Data de início"
                value={fromDate}
                onChange={setFromDate}
                error={fromDateError}
                min={today("Europe/Lisbon")}
              />
              <InputDate
                label="Data de fim"
                value={toDate}
                onChange={setToDate}
                error={toDateError}
                min={fromDate ?? undefined}
              />
            </StackHalfHalf>
          </Stack>
          <Stack row justifyContent="flex-end" gap="1rem">
            <Button label="Cancelar" type="link" onClick={onCancel} />
            <Button
              label={initialPrice ? "Editar" : "Adicionar"}
              type="primary"
              disabled={!fromDate || !toDate}
              onClick={handleAdd}
            />
          </Stack>
        </Stack>
      </Modal>
    </>
  );
};

export default FromToModal;
