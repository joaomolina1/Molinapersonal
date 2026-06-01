import { BOOKING_KINDS, BookingKind } from "@/_constants/booking/kinds";
import AmenitiesItem from "@/_design_system/AmenitiesItem";
import Button, { IconButton } from "@/_design_system/Button";
import Card from "@/_design_system/Card";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceFormsCalendar from "@/_design_system/_icons/UserInterface/Forms/Calendar.svg";
import { createBEMClasses } from "@/_utils/classname";
import { formatDate } from "@/_utils/date";
import { getLocalTimeZone } from "@internationalized/date";
import { useState } from "react";
import { CalendarList } from "../useCalendarList";
import { TimeDuration } from "@/_utils/number";
import InputTextArea from "@/_design_system/InputTextArea";
import { useCreateHostBooking } from "@/_models/booking";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { useShowToast } from "@/_design_system/Toast";
import InputText from "@/_design_system/InputText";
import InputPhone from "@/_design_system/InputPhone";
import InputNumber from "@/_design_system/InputNumber";
import { InputTimeRangeInputs } from "@/_design_system/InputTimeRange";
import { BOOKING_STATUSES, BookingStatus } from "@/_constants/booking/status";
import Tooltip from "@/_design_system/Tooltip";
import IconUserInterfaceMiscellaneousInfo from "@/_design_system/_icons/UserInterface/Miscellaneous/Info.svg";

const { block, element } = createBEMClasses("new-host-booking-modal");

const NewHostBookingModal = ({
  isOpen,
  setIsOpen,
  spaceID,
  date,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  spaceID: string;
  date: CalendarList["venues"][number]["spaces"][number]["weeks"][number]["dates"][number];
}) => {
  const {
    mutateAsync: createHostBooking,
    isPending: isPendingCreateBooking,
    isError: isErrorCreateBooking,
  } = useCreateHostBooking();

  const showToast = useShowToast();

  const save = async () => {
    setShowErrors(true);

    if (error) {
      return;
    }

    await createHostBooking({
      spaceID,
      status,
      kind,
      date: date.date.toString(),
      start: start?.string ?? "",
      end: end?.string ?? "",
      notes,
      contactName: kind === "external" ? contactName : undefined,
      contactEmail: kind === "external" ? contactEmail : undefined,
      contactPhoneExtension:
        kind === "external" ? contactPhone.extension : undefined,
      contactPhoneNumber: kind === "external" ? contactPhone.number : undefined,
      numPeople: kind === "external" ? numPeople : undefined,
      totalAmount: kind === "external" ? totalAmount : undefined,
    });

    closeAndReset();
    showToast({ text: "Reserva criada com sucesso" });
  };

  const closeAndReset = () => {
    setIsOpen(false);
    setStatus("confirmed");
    setKind("external");
    setStart(null);
    setEnd(null);
    setNotes("");
    setShowErrors(false);
  };

  const [status, setStatus] = useState<BookingStatus>("confirmed");
  const [kind, setKind] = useState<BookingKind>("external");
  const [durationType, setDurationType] = useState<"all-day" | "custom">(
    "custom",
  );
  const [start, setStart] = useState<TimeDuration | null>(null);
  const [end, setEnd] = useState<TimeDuration | null>(null);
  const [notes, setNotes] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState<{
    extension?: number;
    number?: number;
  }>({ extension: undefined, number: undefined });
  const [numPeople, setNumPeople] = useState<number>();
  const [totalAmount, setTotalAmount] = useState<number>();

  const [showErrors, setShowErrors] = useState(false);

  const error =
    !status || !kind || !start || !end
      ? "Por favor indique o horário da reserva"
      : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(newIsOpen) =>
        newIsOpen ? setIsOpen(true) : closeAndReset()
      }
      width="x-large"
      ariaLabel="Adicionar reserva"
      showCloseButton={true}
      className={block()}
    >
      <Stack gap="2.5rem">
        <Stack gap="1rem">
          <TextBlock
            subtitle="Adicionar reserva"
            body="Adicione uma reserva que tenha efetuado fora da RINU para bloquear o horário"
          />
          <AmenitiesItem
            icon={<IconUserInterfaceFormsCalendar />}
            iconSize="small"
            textSize="large"
            label={
              <span className={element("date")}>
                {formatDate(date.date.toDate(getLocalTimeZone()), {
                  weekday: "short",
                  day: "numeric",
                  month: "narrow",
                  year: "numeric",
                })}
              </span>
            }
          />
          <div className={element("columns")}>
            <Stack gap="1rem">
              <Stack gap="0.625rem">
                <p className={element("label")}>Tipo de evento</p>
                <div className={element("sub-columns")}>
                  {BOOKING_KINDS.filter(
                    (kind) => kind.id === "external" || kind.id === "block",
                  ).map((bookingKind) => (
                    <Card
                      key={bookingKind.id}
                      type="radio"
                      radioGroupName="booking-kind"
                      text={bookingKind.labelCalendar}
                      checked={kind === bookingKind.id}
                      onChange={() => setKind(bookingKind.id)}
                    />
                  ))}
                </div>
              </Stack>
              <Stack gap="0.625rem">
                <Stack row gap="0.25rem">
                  <span className={element("label")}>Estado da reserva</span>
                  <Tooltip
                    content={
                      <>
                        A pré-reserva deve ser utilizada quando o evento não
                        está totalmente confirmado. Este estado não irá bloquear
                        o calendário do seu espaço. Se quiser bloquear,
                        selecione a opção &quot;Confirmada&quot;.
                      </>
                    }
                    visibleOnTouchDevice
                  >
                    <IconButton
                      showTooltip={false}
                      ariaLabel="Estado da reserva"
                      icon={<IconUserInterfaceMiscellaneousInfo />}
                      style={{ fontSize: "0.75rem" }}
                    />
                  </Tooltip>
                </Stack>
                <div className={element("sub-columns")}>
                  {BOOKING_STATUSES.filter(
                    (status) =>
                      status.id === "preConfirmed" || status.id === "confirmed",
                  ).map((bookingStatus) => (
                    <Card
                      key={bookingStatus.id}
                      type="radio"
                      radioGroupName="booking-status"
                      text={bookingStatus.label}
                      checked={status === bookingStatus.id}
                      onChange={() => setStatus(bookingStatus.id)}
                    />
                  ))}
                </div>
              </Stack>
              <Stack gap="0.625rem">
                <p className={element("label")}>Duração</p>
                <div className={element("sub-columns")}>
                  <Card
                    type="radio"
                    radioGroupName="duration-type"
                    text="Todo o dia"
                    checked={durationType === "all-day"}
                    onChange={() => {
                      setDurationType("all-day");
                      setStart(TimeDuration.fromNumber(6));
                      setEnd(TimeDuration.fromNumber(29.5));
                    }}
                    disabled={!!date.unavailableRangesForHostBooking.length}
                  />
                  <Card
                    type="radio"
                    radioGroupName="duration-type"
                    text="Definir horário"
                    checked={durationType === "custom"}
                    onChange={() => {
                      setDurationType("custom");
                      setStart(null);
                      setEnd(null);
                    }}
                  />
                </div>
              </Stack>
              <div className={element("sub-columns", { desktop: true })}>
                <InputTimeRangeInputs
                  start={start}
                  end={end}
                  setStart={setStart}
                  setEnd={setEnd}
                  unavailableRanges={date.unavailableRangesForHostBooking}
                  disabled={durationType === "all-day"}
                />
              </div>
            </Stack>
            <Stack gap="1rem">
              <InputText
                label="Nome do Cliente"
                value={contactName}
                onChange={setContactName}
                disabled={kind === "block"}
              />
              <InputText
                label="Email"
                value={contactEmail}
                onChange={setContactEmail}
                disabled={kind === "block"}
              />
              <InputPhone
                extension={contactPhone.extension}
                number={contactPhone.number}
                onChange={(extension, number) =>
                  setContactPhone({ extension, number })
                }
                disabled={kind === "block"}
              />
              <InputNumber
                label="Nº de pessoas"
                value={numPeople}
                onChange={setNumPeople}
                allowNegative={false}
                decimalScale={0}
                disabled={kind === "block"}
              />
              <InputNumber
                label="Valor da reserva"
                value={totalAmount}
                onChange={setTotalAmount}
                measure="€"
                allowNegative={false}
                decimalScale={2}
                disabled={kind === "block"}
              />
              <InputTextArea
                label="Nota interna"
                value={notes}
                onChange={setNotes}
                showLabel
                height="small"
              />
            </Stack>
          </div>
          {showErrors && !!error && <InputError error={error} />}
          {showErrors && isErrorCreateBooking && (
            <InputError error="Ocorreu um erro ao criar a reserva" />
          )}
        </Stack>
        <Stack gap="1rem">
          <Button
            type="primary"
            label="Guardar"
            onClick={save}
            loading={isPendingCreateBooking}
          />
          <Button type="secondary" label="Cancelar" onClick={closeAndReset} />
        </Stack>
      </Stack>
    </Modal>
  );
};

export default NewHostBookingModal;
