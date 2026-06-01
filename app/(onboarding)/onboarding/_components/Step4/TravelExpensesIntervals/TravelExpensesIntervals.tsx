import { createBEMClasses } from "@/_utils/classname";
import {
  TravelExpenses as ITravelExpenses,
  TravelExpenseInterval as ITravelExpenseInterval,
} from "./utils";
import { v4 as uuidv4 } from "uuid";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import Button, { IconButton } from "@/_design_system/Button";
import IconUserInterfaceActionsAdd from "@/_design_system/_icons/UserInterface/Actions/Add.svg";
import InputNumber from "@/_design_system/InputNumber";
import IconUserInterfaceActionsDelete from "@/_design_system/_icons/UserInterface/Actions/Delete.svg";
import Tooltip from "@/_design_system/Tooltip";
import IconUserInterfaceMiscellaneousInfo from "@/_design_system/_icons/UserInterface/Miscellaneous/Info.svg";

const { block, element } = createBEMClasses("pack-travel-expenses");

const TravelExpensesIntervals = ({
  intervals = [],
  setIntervals,
  error,
}: {
  intervals?: TravelExpensesIntervalDraft[];
  setIntervals?: (intervals: TravelExpensesIntervalDraft[]) => void;
  error?: string;
}) => {
  const title = "Indique o valor cobrado pela deslocação.";
  const subtitle =
    "Deixe o campo vazio caso não pretenda limite máximo de atuação.";

  const setInterval = (
    id: string,
    newInterval: TravelExpensesIntervalDraft,
  ) => {
    const updatedIntervalIndex = intervals.findIndex(
      (interval) => interval.id === id,
    );

    if (updatedIntervalIndex === -1) {
      return;
    }

    const nextInterval = intervals[updatedIntervalIndex + 1] as
      | TravelExpensesIntervalDraft
      | undefined;

    setIntervals?.(
      intervals?.map((interval) =>
        interval.id === id
          ? newInterval
          : interval.id === nextInterval?.id
            ? {
                ...nextInterval,
                from: newInterval.to,
              }
            : interval,
      ),
    );
  };

  const deleteInterval = (id: string) => {
    const deletedIntervalIndex = intervals.findIndex(
      (interval) => interval.id === id,
    );

    if (deletedIntervalIndex === -1) {
      return;
    }

    const deletedInterval = intervals[deletedIntervalIndex];
    const nextInterval = intervals[deletedIntervalIndex + 1] as
      | TravelExpensesIntervalDraft
      | undefined;

    setIntervals?.(
      intervals
        .filter((interval) => interval.id !== id)
        .map((interval) =>
          interval.id === nextInterval?.id
            ? { ...nextInterval, from: deletedInterval.from }
            : interval,
        ),
    );
  };

  const addInterval = () => {
    const lastInterval = intervals.at(-1);

    setIntervals?.([
      ...intervals,
      initialTravelExpensesInterval({ from: lastInterval?.to }),
    ]);
  };

  return (
    <Stack gap="1rem" alignItems="flex-start">
      <div className="hide-desktop-large">
        <TextBlock label={title} body={subtitle} />
      </div>
      <div className="hide-mobile-large">
        <TextBlock subtitle={title} body={subtitle} />
      </div>
      {error && <InputError error={error} />}
      <div className={block()}>
        <IntervalsDesktop
          intervals={intervals}
          setInterval={setInterval}
          deleteInterval={deleteInterval}
        />
        <ExtrasMobile
          intervals={intervals}
          setInterval={setInterval}
          deleteInterval={deleteInterval}
        />
        <Button
          type="link"
          leftIcon={<IconUserInterfaceActionsAdd />}
          label="Adicionar linha"
          onClick={addInterval}
        />
      </div>
    </Stack>
  );
};

const IntervalsDesktop = ({
  intervals,
  setInterval,
  deleteInterval,
}: {
  intervals: TravelExpensesIntervalDraft[];
  setInterval: (id: string, newInterval: TravelExpensesIntervalDraft) => void;
  deleteInterval: (id: string) => void;
}) => {
  if (!intervals.length) {
    return null;
  }

  return (
    <div className={element("table-wrapper", undefined, "hide-mobile-large")}>
      <table
        aria-label="Tabel de preços de deslocação"
        className={element("table")}
      >
        <thead>
          <tr>
            <th>De</th>
            <th>Até</th>
            <th>
              <Stack row gap="0.25rem">
                <span>Valor Total</span>
                <Tooltip
                  content={
                    <>
                      Coloque o valor total da deslocação para o raio indicado.
                      Não o valor por km.
                    </>
                  }
                  visibleOnTouchDevice
                >
                  <IconButton
                    showTooltip={false}
                    ariaLabel="Valor Total"
                    icon={<IconUserInterfaceMiscellaneousInfo />}
                    style={{ fontSize: "0.75rem" }}
                  />
                </Tooltip>
              </Stack>
            </th>
            <th />
          </tr>
        </thead>
        <tbody>
          {intervals.map((interval) => (
            <IntervalDesktopRow
              key={interval.id}
              interval={interval}
              setInterval={(newInterval) =>
                setInterval(interval.id, newInterval)
              }
              deleteInterval={() => deleteInterval(interval.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const IntervalDesktopRow = ({
  interval,
  setInterval,
  deleteInterval,
}: {
  interval: TravelExpensesIntervalDraft;
  setInterval: (interval: TravelExpensesIntervalDraft) => void;
  deleteInterval: () => void;
}) => {
  return (
    <tr>
      <td>
        <CellFrom interval={interval} />
      </td>
      <td>
        <CellTo interval={interval} setInterval={setInterval} />
      </td>
      <td>
        <CellPrice interval={interval} setInterval={setInterval} />
      </td>
      <td>
        <div className={element("delete")}>
          <IconButton
            icon={<IconUserInterfaceActionsDelete />}
            onClick={deleteInterval}
            ariaLabel="Apagar"
          />
        </div>
      </td>
    </tr>
  );
};

const ExtrasMobile = ({
  intervals,
  setInterval,
  deleteInterval,
}: {
  intervals: TravelExpensesIntervalDraft[];
  setInterval: (id: string, newInterval: TravelExpensesIntervalDraft) => void;
  deleteInterval: (id: string) => void;
}) => {
  return (
    <div className="hide-desktop-large">
      <Stack gap="1rem">
        {intervals.map((interval) => (
          <IntervalMobileRow
            key={interval.id}
            interval={interval}
            deleteInterval={() => deleteInterval(interval.id)}
            setInterval={(newInterval) => setInterval(interval.id, newInterval)}
          />
        ))}
      </Stack>
    </div>
  );
};

const IntervalMobileRow = ({
  interval,
  deleteInterval,
  setInterval,
}: {
  interval: TravelExpensesIntervalDraft;
  deleteInterval: () => void;
  setInterval: (interval: TravelExpensesIntervalDraft) => void;
}) => {
  return (
    <div className={element("mobile")}>
      <div className={element("mobile__name", { first: true })}>De</div>
      <div className={element("mobile__value", { first: true })}>
        <CellFrom interval={interval} />
      </div>
      <div className={element("mobile__name")}>Até</div>
      <div className={element("mobile__value")}>
        <CellTo interval={interval} setInterval={setInterval} />
      </div>
      <div className={element("mobile__name")}>Valor</div>
      <div className={element("mobile__value")}>
        <CellPrice interval={interval} setInterval={setInterval} />
      </div>
      <Button
        type="link"
        leftIcon={<IconUserInterfaceActionsDelete />}
        label="Eliminar linha"
        onClick={deleteInterval}
        className={element("mobile__delete")}
      />
    </div>
  );
};

const CellFrom = ({ interval }: { interval: TravelExpensesIntervalDraft }) => {
  return <div className={element("disabled")}>{interval.from} Km</div>;
};

const CellTo = ({
  interval,
  setInterval,
}: {
  interval: TravelExpensesIntervalDraft;
  setInterval: (interval: TravelExpensesIntervalDraft) => void;
}) => {
  return (
    <InputNumber
      label="Até"
      showLabel={false}
      measure="Km"
      value={interval.to}
      onChange={(value) => setInterval({ ...interval, to: value })}
      allowNegative={false}
      decimalScale={0}
    />
  );
};

const CellPrice = ({
  interval,
  setInterval,
}: {
  interval: TravelExpensesIntervalDraft;
  setInterval: (interval: TravelExpensesIntervalDraft) => void;
}) => {
  return (
    <InputNumber
      label="Valor"
      showLabel={false}
      measure="€"
      value={interval.price}
      onChange={(value) => setInterval({ ...interval, price: value })}
      allowNegative={false}
      decimalScale={2}
      placeholder="0"
    />
  );
};

export type TravelExpensesDraft = Partial<
  Omit<ITravelExpenses, "intervals">
> & {
  intervals: TravelExpensesIntervalDraft[];
};

export type TravelExpensesIntervalDraft = Partial<
  Omit<ITravelExpenseInterval, "id">
> & {
  id: ITravelExpenseInterval["id"];
};

export const initialTravelExpenses = (): TravelExpensesDraft => {
  return {
    from_billing: true,
    intervals: [],
  };
};

const initialTravelExpensesInterval = (options?: {
  from?: number;
}): TravelExpensesIntervalDraft => ({
  id: uuidv4(),
  from: options?.from ?? 0,
});

export const getTravelExpensesIntervalsError = (
  intervals: TravelExpensesIntervalDraft[],
): string | undefined => {
  if (intervals.length === 0) {
    return undefined;
  }

  if (
    intervals.some(
      (interval) =>
        interval.from === undefined ||
        !interval.to ||
        interval.price === undefined,
    )
  ) {
    return "Preencha os detalhes de todos os intervalos";
  }

  if (
    intervals.some(
      (interval) =>
        !!interval.from && !!interval.to && interval.to <= interval.from,
    )
  ) {
    return `Verifique os valores nas colunas "De" e "Até"`;
  }

  return undefined;
};

export default TravelExpensesIntervals;
