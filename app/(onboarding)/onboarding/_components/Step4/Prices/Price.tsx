import { createBEMClasses } from "@/_utils/classname";
import { PriceDraft, PriceScheduleDraft, initialSchedule } from "./Prices";
import Tag from "@/_design_system/Tag";
import { DAYS_OF_WEEK, formatDate } from "@/_utils/date";
import Button, { IconButton } from "@/_design_system/Button";
import IconUserInterfaceActionsAdd from "@/_design_system/_icons/UserInterface/Actions/Add.svg";
import InputSelect from "@/_design_system/InputSelect";
import InputNumber from "@/_design_system/InputNumber";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "react-aria-components";
import IconUserInterfaceFormsCalendar from "@/_design_system/_icons/UserInterface/Forms/Calendar.svg";
import IconUserInterfaceActionsDelete from "@/_design_system/_icons/UserInterface/Actions/Delete.svg";
import Stack from "@/_design_system/Stack";
import IconUserInterfaceActionsEdit from "@/_design_system/_icons/UserInterface/Actions/Edit.svg";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { TimeDuration, formatMoney } from "@/_utils/number";
import { ReactNode } from "react";
import IconUserInterfaceMiscellaneousClock from "@/_design_system/_icons/UserInterface/Miscellaneous/Clock.svg";
import { PRICE_SCHEDULE_TYPES, PriceScheduleType } from "./utils";

const { block, element } = createBEMClasses("pricing-period");

const PriceComponent = ({
  price,
  setPrice,
  deletePrice,
  onEditFromTo,
  error,
  mode,
}: {
  price: PriceDraft;
  setPrice: (period: PriceDraft) => void;
  deletePrice: () => void;
  onEditFromTo: () => void;
  error?: string;
  mode: "edit" | "admin-view" | "client-view";
}) => {
  const deleteSchedule = (id: string) => {
    if (price.schedules.length === 1) {
      deletePrice();
    } else {
      setPrice({
        ...price,
        schedules: price.schedules.filter((schedule) => schedule.id !== id),
      });
    }
  };

  const addSchedule = () => {
    setPrice({
      ...price,
      schedules: [...price.schedules, initialSchedule()],
    });
  };

  const setSchedule = (id: string, newSchedule: PriceScheduleDraft) => {
    setPrice({
      ...price,
      schedules: price.schedules.map((schedule) =>
        schedule.id === id ? newSchedule : schedule,
      ),
    });
  };

  return (
    <div className={block()}>
      <Stack row>
        <Tag
          size="medium"
          text={`${formatDate(new Date(price.from))} · ${formatDate(
            new Date(price.to),
          )}`}
          iconLeft={<IconUserInterfaceFormsCalendar />}
          iconRight={
            mode === "edit" ? (
              <IconButton
                icon={<IconUserInterfaceActionsEdit />}
                onClick={onEditFromTo}
                ariaLabel="Eliminar"
              />
            ) : undefined
          }
          border={false}
          style={{ paddingLeft: 0 }}
        />
      </Stack>
      {!!error && (
        <div style={{ padding: "0 16px 8px" }}>
          <InputError error={error} />
        </div>
      )}
      {mode !== "client-view" && (
        <PriceSchedulesMobile
          price={price}
          setSchedule={setSchedule}
          deleteSchedule={deleteSchedule}
          mode={mode}
        />
      )}
      <PriceSchedulesDesktop
        price={price}
        setSchedule={setSchedule}
        deleteSchedule={deleteSchedule}
        mode={mode}
      />
      {mode === "edit" && (
        <Button
          type="link"
          leftIcon={<IconUserInterfaceActionsAdd />}
          label="Adicionar linha"
          onClick={addSchedule}
        />
      )}
    </div>
  );
};

const PriceSchedulesMobile = ({
  price,
  deleteSchedule,
  setSchedule,
  mode,
}: {
  price: PriceDraft;
  deleteSchedule: (id: string) => void;
  setSchedule: (id: string, schedule: PriceScheduleDraft) => void;
  mode: "edit" | "admin-view" | "client-view";
}) => {
  return (
    <div className="hide-desktop-x-large">
      <Stack gap="1rem">
        {price.schedules.map((schedule) => (
          <PriceScheduleMobileRow
            key={schedule.id}
            schedule={schedule}
            deleteSchedule={() => deleteSchedule(schedule.id)}
            setSchedule={(newSchedule) => setSchedule(schedule.id, newSchedule)}
            mode={mode}
          />
        ))}
      </Stack>
    </div>
  );
};

const PriceScheduleMobileRow = ({
  schedule,
  deleteSchedule,
  setSchedule,
  mode,
}: {
  schedule: PriceScheduleDraft;
  deleteSchedule: () => void;
  setSchedule: (schedule: PriceScheduleDraft) => void;
  mode: "edit" | "admin-view" | "client-view";
}) => {
  return (
    <div className={element("mobile")}>
      {mode !== "client-view" && (
        <>
          <div className={element("mobile__name", { first: true })}>
            Tipo de Preço
          </div>
          <div className={element("mobile__value", { first: true })}>
            <CellScheduleType
              schedule={schedule}
              setSchedule={setSchedule}
              mode={mode}
            />
          </div>
          <div className={element("mobile__name")}>Valor por pessoa</div>
          <div className={element("mobile__value")}>
            <CellValuePerson
              schedule={schedule}
              setSchedule={setSchedule}
              mode={mode}
            />
          </div>
          <div className={element("mobile__name")}>Valor por hora</div>
          <div className={element("mobile__value")}>
            <CellValueHour
              schedule={schedule}
              setSchedule={setSchedule}
              mode={mode}
            />
          </div>
          <div className={element("mobile__name")}>Gasto mín</div>
          <div className={element("mobile__value")}>
            <CellMinValue
              schedule={schedule}
              setSchedule={setSchedule}
              mode={mode}
            />
          </div>
        </>
      )}
      <div className={element("mobile__name")}>Desde</div>
      <div className={element("mobile__value")}>
        <CellStart schedule={schedule} setSchedule={setSchedule} mode={mode} />
      </div>
      <div className={element("mobile__name")}>Até</div>
      <div className={element("mobile__value")}>
        <CellEnd schedule={schedule} setSchedule={setSchedule} mode={mode} />
      </div>
      <div className={element("mobile__name")}>Dias da semana</div>
      <div className={element("mobile__value")}>
        <CellDaysOfWeek
          schedule={schedule}
          setSchedule={setSchedule}
          mode={mode}
        />
      </div>
      {mode === "edit" && (
        <Button
          type="link"
          leftIcon={<IconUserInterfaceActionsDelete />}
          label="Eliminar linha"
          onClick={deleteSchedule}
          className={element("mobile__delete")}
        />
      )}
    </div>
  );
};

const PriceSchedulesDesktop = ({
  price,
  deleteSchedule,
  setSchedule,
  mode,
}: {
  price: PriceDraft;
  deleteSchedule: (id: string) => void;
  setSchedule: (id: string, schedule: PriceScheduleDraft) => void;
  mode: "edit" | "admin-view" | "client-view";
}) => {
  return (
    <div
      className={element(
        "table-wrapper",
        undefined,
        mode !== "client-view" ? "hide-mobile-x-large" : undefined,
      )}
    >
      <Table aria-label="Preço" className={element("table")}>
        <TableHeader>
          {mode !== "client-view" && (
            <>
              <Column isRowHeader width={172}>
                Tipo de preço
              </Column>
              <Column>Valor por pessoa</Column>
              <Column>Valor por hora</Column>
              <Column>Gasto mín</Column>
            </>
          )}
          <Column isRowHeader={mode === "client-view"}>Desde</Column>
          <Column>Até</Column>
          <Column>Dias da semana</Column>
          {mode === "edit" && <Column />}
        </TableHeader>
        <TableBody>
          {price.schedules.map((schedule) => (
            <PriceScheduleDesktopRow
              key={schedule.id}
              schedule={schedule}
              deleteSchedule={() => deleteSchedule(schedule.id)}
              setSchedule={(newSchedule) =>
                setSchedule(schedule.id, newSchedule)
              }
              mode={mode}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const PriceScheduleDesktopRow = ({
  schedule,
  deleteSchedule,
  setSchedule,
  mode,
}: {
  schedule: PriceScheduleDraft;
  deleteSchedule: () => void;
  setSchedule: (schedule: PriceScheduleDraft) => void;
  mode: "edit" | "admin-view" | "client-view";
}) => {
  return (
    <Row>
      {mode !== "client-view" && (
        <>
          <Cell>
            <CellScheduleType
              schedule={schedule}
              setSchedule={setSchedule}
              mode={mode}
            />
          </Cell>
          <Cell>
            <CellValuePerson
              schedule={schedule}
              setSchedule={setSchedule}
              mode={mode}
            />
          </Cell>
          <Cell>
            <CellValueHour
              schedule={schedule}
              setSchedule={setSchedule}
              mode={mode}
            />
          </Cell>
          <Cell>
            <CellMinValue
              schedule={schedule}
              setSchedule={setSchedule}
              mode={mode}
            />
          </Cell>
        </>
      )}
      <Cell>
        <CellStart schedule={schedule} setSchedule={setSchedule} mode={mode} />
      </Cell>
      <Cell>
        <CellEnd schedule={schedule} setSchedule={setSchedule} mode={mode} />
      </Cell>
      <Cell>
        <CellDaysOfWeek
          schedule={schedule}
          setSchedule={setSchedule}
          mode={mode}
        />
      </Cell>
      {mode === "edit" && (
        <Cell>
          <div className={element("delete")}>
            <IconButton
              icon={<IconUserInterfaceActionsDelete />}
              onClick={deleteSchedule}
              ariaLabel="Apagar"
            />
          </div>
        </Cell>
      )}
    </Row>
  );
};

const CellScheduleType = ({
  schedule,
  setSchedule,
  mode,
}: {
  schedule: PriceScheduleDraft;
  setSchedule: (price: PriceScheduleDraft) => void;
  mode: "edit" | "admin-view" | "client-view";
}) => {
  const onChangeScheduleType = (newScheduleType: PriceScheduleType) => {
    if (newScheduleType === "per-hour") {
      setSchedule({
        ...schedule,
        type: newScheduleType,
        valuePerson: undefined,
      });
    } else if (newScheduleType === "per-person") {
      setSchedule({
        ...schedule,
        type: newScheduleType,
        valueHour: undefined,
      });
    } else if (newScheduleType === "per-hour-and-person") {
      setSchedule({
        ...schedule,
        type: newScheduleType,
      });
    }
  };

  if (mode !== "edit") {
    return (
      <CellViewMode
        value={
          PRICE_SCHEDULE_TYPES.find((type) => type.id === schedule.type)?.text
        }
      />
    );
  }

  return (
    <InputSelect
      value={schedule.type}
      onChange={onChangeScheduleType}
      label="Tipo de preço"
      showLabel={false}
      options={PRICE_SCHEDULE_TYPES}
      className={element("price-type")}
    />
  );
};

const CellValuePerson = ({
  schedule,
  setSchedule,
  mode,
}: {
  schedule: PriceScheduleDraft;
  setSchedule: (schedule: PriceScheduleDraft) => void;
  mode: "edit" | "admin-view" | "client-view";
}) => {
  if (mode !== "edit") {
    return <CellViewMode value={formatMoney(schedule.valuePerson)} />;
  }

  return schedule.type === "per-person" ||
    schedule.type === "per-hour-and-person" ? (
    <InputNumber
      label="Valor por pessoa"
      showLabel={false}
      measure="€/p"
      value={schedule.valuePerson}
      onChange={(value) => setSchedule({ ...schedule, valuePerson: value })}
      allowNegative={false}
      decimalScale={2}
      placeholder="0"
    />
  ) : (
    <div className={element("disabled")}>-</div>
  );
};

const CellValueHour = ({
  schedule,
  setSchedule,
  mode,
}: {
  schedule: PriceScheduleDraft;
  setSchedule: (schedule: PriceScheduleDraft) => void;
  mode: "edit" | "admin-view" | "client-view";
}) => {
  if (mode !== "edit") {
    return <CellViewMode value={formatMoney(schedule.valueHour)} />;
  }

  return schedule.type === "per-hour" ||
    schedule.type === "per-hour-and-person" ? (
    <InputNumber
      label="Valor por hora"
      showLabel={false}
      measure="€/h"
      value={schedule.valueHour}
      onChange={(value) => setSchedule({ ...schedule, valueHour: value })}
      allowNegative={false}
      decimalScale={2}
      placeholder="0"
    />
  ) : (
    <div className={element("disabled")}>-</div>
  );
};

const CellMinValue = ({
  schedule,
  setSchedule,
  mode,
}: {
  schedule: PriceScheduleDraft;
  setSchedule: (schedule: PriceScheduleDraft) => void;
  mode: "edit" | "admin-view" | "client-view";
}) => {
  if (mode !== "edit") {
    return <CellViewMode value={formatMoney(schedule.minValue)} />;
  }

  return (
    <InputNumber
      label="Gasto mín"
      showLabel={false}
      measure="€"
      value={schedule.minValue}
      onChange={(value) => setSchedule({ ...schedule, minValue: value })}
      allowNegative={false}
      decimalScale={2}
      placeholder="0"
    />
  );
};

const CellStart = ({
  schedule,
  setSchedule,
  mode,
}: {
  schedule: PriceScheduleDraft;
  setSchedule: (schedule: PriceScheduleDraft) => void;
  mode: "edit" | "admin-view" | "client-view";
}) => {
  if (mode !== "edit") {
    return (
      <CellViewMode
        value={
          <Stack row gap="0.25rem" alignItems="center">
            <IconUserInterfaceMiscellaneousClock
              style={{ fontSize: "1rem " }}
            />
            {
              scheduleStartEndOptions.find(
                (option) => option.id === schedule.start?.id,
              )?.timeLabel
            }
          </Stack>
        }
      />
    );
  }

  return (
    <InputSelect
      value={schedule.start?.id}
      onChange={(value) => {
        const newStart = TimeDuration.fromNumber(parseFloat(value));

        if (
          !!newStart &&
          !!schedule.end &&
          newStart.number >= schedule.end.number
        ) {
          setSchedule({ ...schedule, start: newStart, end: null });
        } else {
          setSchedule({ ...schedule, start: newStart });
        }
      }}
      label="Desde"
      showLabel={false}
      placeholder="Hora"
      options={scheduleStartEndOptions.map((option) => option.selectOption)}
      className={element("hour")}
    />
  );
};

const CellEnd = ({
  schedule,
  setSchedule,
  mode,
}: {
  schedule: PriceScheduleDraft;
  setSchedule: (schedule: PriceScheduleDraft) => void;
  mode: "edit" | "admin-view" | "client-view";
}) => {
  const endOptions = scheduleStartEndOptions.filter((option) =>
    schedule.start ? option.number > schedule.start?.number : true,
  );

  if (mode !== "edit") {
    return (
      <CellViewMode
        value={
          <Stack row gap="0.25rem" alignItems="center">
            <IconUserInterfaceMiscellaneousClock
              style={{ fontSize: "1rem " }}
            />
            {
              scheduleStartEndOptions.find(
                (option) => option.id === schedule.end?.id,
              )?.timeLabel
            }
          </Stack>
        }
      />
    );
  }

  return (
    <InputSelect
      value={schedule.end?.id}
      onChange={(value) =>
        setSchedule({
          ...schedule,
          end: TimeDuration.fromNumber(parseFloat(value)),
        })
      }
      label="Até"
      showLabel={false}
      placeholder="Hora"
      options={endOptions.map((option) => option.selectOption)}
      className={element("hour")}
    />
  );
};

const CellDaysOfWeek = ({
  schedule,
  setSchedule,
  mode,
}: {
  schedule: PriceScheduleDraft;
  setSchedule: (schedule: PriceScheduleDraft) => void;
  mode: "edit" | "admin-view" | "client-view";
}) => {
  const value = schedule.daysOfWeek ?? [];
  const editMode = mode === "edit";

  return (
    <Stack
      row
      gap="0.25rem"
      alignItems="center"
      justifyContent="center"
      className={element("weekdays")}
    >
      {DAYS_OF_WEEK.map((dayOfWeek) => (
        <label
          className={element("weekdays__day", { editMode })}
          key={dayOfWeek.id}
        >
          <input
            type="checkbox"
            checked={value.includes(dayOfWeek.id)}
            onChange={() =>
              setSchedule({
                ...schedule,
                daysOfWeek: value.includes(dayOfWeek.id)
                  ? value.filter((id) => id !== dayOfWeek.id)
                  : [...value, dayOfWeek.id],
              })
            }
            disabled={!editMode}
          />
          <div aria-label={dayOfWeek.label}>{dayOfWeek.text}</div>
        </label>
      ))}
    </Stack>
  );
};

const CellViewMode = ({ value }: { value?: ReactNode }) => (
  <div className={element("view-value")}>{value}</div>
);

export const scheduleStartEndOptions = Array.from(Array(24).keys()).flatMap(
  (hours) =>
    [0, 0.5].map((minutesInHours) =>
      TimeDuration.fromNumber(hours + minutesInHours + 6),
    ),
);

export default PriceComponent;
