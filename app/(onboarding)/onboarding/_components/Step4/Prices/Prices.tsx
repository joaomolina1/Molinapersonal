import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { v4 as uuidv4 } from "uuid";
import FromToModal from "./FromToModal";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import PriceComponent from "./Price";
import Button from "@/_design_system/Button";
import IconUserInterfaceFormsCalendarAdd from "@/_design_system/_icons/UserInterface/Forms/CalendarAdd.svg";
import { useState } from "react";
import { Price, PriceSchedule } from "./utils";

const Prices = ({
  prices = [],
  setPrices,
  error,
  mode = "edit",
}: {
  prices?: PriceDraft[];
  setPrices?: (prices: PriceDraft[]) => void;
  error?: string;
  mode?: "edit" | "admin-view" | "client-view";
}) => {
  const [isOpenFromToModal, setIsOpenFromToModal] = useState(false);
  const [priceToEdit, setPriceToEdit] = useState<PriceDraft>();

  const addNewPrice = (from: string, to: string) => {
    setPrices?.([
      ...prices,
      {
        id: uuidv4(),
        from,
        to,
        schedules: [initialSchedule()],
      },
    ]);

    setIsOpenFromToModal(false);
  };

  const editPrice = (from: string, to: string) => {
    setPrices?.(
      prices?.map((price) =>
        price.id === priceToEdit?.id
          ? {
              ...price,
              from,
              to,
            }
          : price,
      ),
    );

    setIsOpenFromToModal(false);
    setPriceToEdit(undefined);
  };

  const setPrice = (id: string, newPrice: PriceDraft) => {
    setPrices?.(prices.map((price) => (price.id === id ? newPrice : price)));
  };

  const deletePrice = (id: string) => {
    setPrices?.(prices.filter((price) => price.id !== id));
  };

  return (
    <Stack gap="24px" alignItems="flex-start">
      {mode === "edit" && (
        <>
          <div className="hide-desktop-large">
            <TextBlock
              label="Qual o preço deste pack?"
              body="Comece por indicar o período em que o preço é válido. Depois, selecione quando é que o pack está disponível e o tipo de preço incluíndo o IVA (valor por hora, por pessoa ou misto)"
            />
          </div>
          <div className="hide-mobile-large">
            <TextBlock
              subtitle="Qual o preço deste pack?"
              body="Comece por indicar o período em que o preço é válido. Depois, selecione quando é que o pack está disponível e o tipo de preço incluíndo o IVA (valor por hora, por pessoa ou misto)"
            />
          </div>
          {error && <InputError error={error} />}
        </>
      )}
      {prices.map((price) => (
        <PriceComponent
          key={price.id}
          price={price}
          setPrice={(price) => setPrice(price.id, price)}
          deletePrice={() => deletePrice(price.id)}
          onEditFromTo={() => {
            setPriceToEdit(price);
            setIsOpenFromToModal(true);
          }}
          error={error ? getPriceError(price) : undefined}
          mode={mode}
        />
      ))}
      {mode === "edit" && (
        <>
          <Button
            label="Adicionar período"
            leftIcon={<IconUserInterfaceFormsCalendarAdd />}
            type="secondary"
            onClick={() => setIsOpenFromToModal(true)}
          />
          <FromToModal
            key={priceToEdit?.id}
            initialPrice={priceToEdit}
            onAddPrice={addNewPrice}
            onEditPrice={editPrice}
            onCancel={() => {
              setIsOpenFromToModal(false);
              setPriceToEdit(undefined);
            }}
            isOpen={isOpenFromToModal}
            setIsOpen={setIsOpenFromToModal}
          />
        </>
      )}
    </Stack>
  );
};

export const initialSchedule = (): PriceScheduleDraft => ({
  id: uuidv4(),
  type: "per-person",
  daysOfWeek: [],
});

export type PriceDraft = Omit<Price, "schedules"> & {
  schedules: PriceScheduleDraft[];
};

export type PriceScheduleDraft = Partial<
  Omit<PriceSchedule, "id" | "type" | "daysOfWeek">
> & {
  id: PriceSchedule["id"];
  type: PriceSchedule["type"];
  daysOfWeek: PriceSchedule["daysOfWeek"];
};

export const getPricesError = (prices: PriceDraft[]): string | undefined => {
  if (prices.length === 0) {
    return "Campo de preenchimento obrigatório";
  }

  const doPricesOverlap = prices.some((price) =>
    prices.find(
      (otherPrice) =>
        price.id !== otherPrice.id &&
        new Date(price.from) >= new Date(otherPrice.from) &&
        new Date(price.from) <= new Date(otherPrice.to),
    ),
  );

  if (doPricesOverlap) {
    return "Os períodos indicados sobrepõem-se";
  }

  const doPricesHaveErrors = prices.some((price) => !!getPriceError(price));

  if (doPricesHaveErrors) {
    return "Verifique os detalhes de todos os períodos";
  }

  return undefined;
};

export const getPriceError = (price: PriceDraft): string | undefined => {
  const areSchedulesComplete = price.schedules.every(
    (schedule) =>
      (!!schedule.valuePerson || !!schedule.valueHour) &&
      !!schedule.start &&
      !!schedule.end &&
      !!schedule.daysOfWeek &&
      schedule.daysOfWeek.length > 0,
  );

  if (!areSchedulesComplete) {
    return "Em cada linha, por favor preencha o valor, os campos de horas e os dias da semana em que a linha é válida";
  }

  const isEndAfterStart = price.schedules.every(
    (schedule) =>
      !!schedule.end &&
      !!schedule.start &&
      schedule.end.number > schedule.start.number,
  );

  if (!isEndAfterStart) {
    return "Em cada linha, a hora final deve ser após a hora inicial";
  }

  const doSchedulesOverlap = price.schedules.some((schedule) =>
    price.schedules.find(
      (otherSchedule) =>
        schedule.id !== otherSchedule.id &&
        schedule.daysOfWeek?.some((dayOfWeek) =>
          otherSchedule.daysOfWeek?.includes(dayOfWeek),
        ) &&
        schedule.start!.number >= otherSchedule.start!.number &&
        schedule.start!.number < otherSchedule.end!.number,
    ),
  );

  if (doSchedulesOverlap) {
    return "Os horários indicados sobrepõem-se";
  }
};

export default Prices;
