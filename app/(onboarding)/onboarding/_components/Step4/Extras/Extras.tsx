import Stack from "@/_design_system/Stack";
import { Extra, EXTRA_PRICE_TYPES, ExtraPriceType, ExtraDraft } from "./utils";
import {
  ExtraQuantityCells,
  ExtraTooltipCell,
} from "./ExtrasQuantityFields";
import TextBlock from "@/_design_system/TextBlock";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { createBEMClasses } from "@/_utils/classname";
import { v4 as uuidv4 } from "uuid";
import InputText from "@/_design_system/InputText";
import InputSelect from "@/_design_system/InputSelect";
import InputNumber from "@/_design_system/InputNumber";
import Button, { IconButton } from "@/_design_system/Button";
import IconUserInterfaceActionsDelete from "@/_design_system/_icons/UserInterface/Actions/Delete.svg";
import IconUserInterfaceActionsAdd from "@/_design_system/_icons/UserInterface/Actions/Add.svg";
import InputCheckbox from "@/_design_system/InputCheckbox";

const { block, element } = createBEMClasses("pack-extras-table");

const Extras = ({
  extras = [],
  setExtras,
  error,
}: {
  extras?: ExtraDraft[];
  setExtras?: (extras: ExtraDraft[]) => void;
  error?: string;
}) => {
  const title = "Quer associar extras a este pack?";
  const subtitle =
    "Se tiver características extra que podem ser adicionadas ao pack, adicione linhas para indicar o que tem disponível e qual o valor.";

  const setExtra = (id: string, newExtra: ExtraDraft) => {
    setExtras?.(extras.map((extra) => (extra.id === id ? newExtra : extra)));
  };

  const deleteExtra = (id: string) => {
    setExtras?.(extras.filter((extra) => extra.id !== id));
  };

  const addExtra = () => {
    setExtras?.([...extras, initialExtra()]);
  };

  return (
    <Stack gap="1.5rem" alignItems="flex-start">
      <div className="hide-desktop-large">
        <TextBlock label={title} body={subtitle} />
      </div>
      <div className="hide-mobile-large">
        <TextBlock subtitle={title} body={subtitle} />
      </div>
      {error && <InputError error={error} />}
      <div className={block()}>
        <ExtrasDesktop
          extras={extras}
          setExtra={setExtra}
          deleteExtra={deleteExtra}
        />
        <ExtrasMobile
          extras={extras}
          setExtra={setExtra}
          deleteExtra={deleteExtra}
        />
        <Button
          type="link"
          leftIcon={<IconUserInterfaceActionsAdd />}
          label="Adicionar extra"
          onClick={addExtra}
        />
      </div>
    </Stack>
  );
};

const ExtrasDesktop = ({
  extras,
  setExtra,
  deleteExtra,
}: {
  extras: ExtraDraft[];
  setExtra: (id: string, newExtra: ExtraDraft) => void;
  deleteExtra: (id: string) => void;
}) => {
  if (!extras.length) {
    return null;
  }

  return (
    <div className={element("table-wrapper", undefined, "hide-mobile-x-large")}>
      <table aria-label="Tabel de extras" className={element("table")}>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Tooltip</th>
            <th>Tipo de preço</th>
            <th>Valor fixo</th>
            <th>Valor por pessoa</th>
            <th>Valor por hora</th>
            <th>Hora default</th>
            <th>Hora min</th>
            <th>Hora max</th>
            <th>Pax default</th>
            <th>Pax min</th>
            <th>Pax max</th>
            <th>Obrigatório</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {extras.map((extra) => (
            <ExtraDesktopRow
              key={extra.id}
              extra={extra}
              setExtra={(newExtra) => setExtra(extra.id, newExtra)}
              deleteExtra={() => deleteExtra(extra.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ExtraDesktopRow = ({
  extra,
  setExtra,
  deleteExtra,
}: {
  extra: ExtraDraft;
  setExtra: (extra: ExtraDraft) => void;
  deleteExtra: () => void;
}) => {
  return (
    <tr>
      <td>
        <CellDescription extra={extra} setExtra={setExtra} />
      </td>
      <td>
        <ExtraTooltipCell extra={extra} setExtra={setExtra} />
      </td>
      <td>
        <CellPriceType extra={extra} setExtra={setExtra} />
      </td>
      <td>
        <CellFixedPrice extra={extra} setExtra={setExtra} />
      </td>
      <td>
        <CellPricePax extra={extra} setExtra={setExtra} />
      </td>
      <td>
        <CellPriceHour extra={extra} setExtra={setExtra} />
      </td>
      <ExtraQuantityCells extra={extra} setExtra={setExtra} variant="desktop" />
      <td>
        <CellMandatory extra={extra} setExtra={setExtra} />
      </td>
      <td>
        <div className={element("delete")}>
          <IconButton
            icon={<IconUserInterfaceActionsDelete />}
            onClick={deleteExtra}
            ariaLabel="Apagar"
          />
        </div>
      </td>
    </tr>
  );
};

const ExtrasMobile = ({
  extras,
  setExtra,
  deleteExtra,
}: {
  extras: ExtraDraft[];
  setExtra: (id: string, newExtra: ExtraDraft) => void;
  deleteExtra: (id: string) => void;
}) => {
  return (
    <div className="hide-desktop-x-large">
      <Stack gap="1rem">
        {extras.map((extra) => (
          <ExtraMobileRow
            key={extra.id}
            extra={extra}
            deleteExtra={() => deleteExtra(extra.id)}
            setExtra={(newExtra) => setExtra(extra.id, newExtra)}
          />
        ))}
      </Stack>
    </div>
  );
};

const ExtraMobileRow = ({
  extra,
  deleteExtra,
  setExtra,
}: {
  extra: ExtraDraft;
  deleteExtra: () => void;
  setExtra: (extra: ExtraDraft) => void;
}) => {
  return (
    <div className={element("mobile")}>
      <div className={element("mobile__name", { first: true })}>Descrição</div>
      <div className={element("mobile__value", { first: true })}>
        <CellDescription extra={extra} setExtra={setExtra} />
      </div>
      <div className={element("mobile__name")}>Tooltip</div>
      <div className={element("mobile__value")}>
        <ExtraTooltipCell extra={extra} setExtra={setExtra} />
      </div>
      <div className={element("mobile__name")}>Tipo de Preço</div>
      <div className={element("mobile__value")}>
        <CellPriceType extra={extra} setExtra={setExtra} />
      </div>
      <div className={element("mobile__name")}>Valor fixo</div>
      <div className={element("mobile__value")}>
        <CellFixedPrice extra={extra} setExtra={setExtra} />
      </div>
      <div className={element("mobile__name")}>Valor por pessoa</div>
      <div className={element("mobile__value")}>
        <CellPricePax extra={extra} setExtra={setExtra} />
      </div>
      <div className={element("mobile__name")}>Valor por hora</div>
      <div className={element("mobile__value")}>
        <CellPriceHour extra={extra} setExtra={setExtra} />
      </div>
      <div className={element("mobile__name")}>Obrigatório</div>
      <div className={element("mobile__value")}>
        <CellMandatory extra={extra} setExtra={setExtra} />
      </div>
      <div className={element("mobile__quantity")}>
        <ExtraQuantityCells extra={extra} setExtra={setExtra} variant="mobile" />
      </div>
      <Button
        type="link"
        leftIcon={<IconUserInterfaceActionsDelete />}
        label="Eliminar linha"
        onClick={deleteExtra}
        className={element("mobile__delete")}
      />
    </div>
  );
};

const CellDescription = ({
  extra,
  setExtra,
}: {
  extra: ExtraDraft;
  setExtra: (extra: ExtraDraft) => void;
}) => {
  return (
    <InputText
      label="Descrição"
      placeholder="Descrição"
      showLabel={false}
      value={extra.description}
      onChange={(value) => setExtra({ ...extra, description: value })}
      className={element("description")}
    />
  );
};

const CellPriceType = ({
  extra,
  setExtra,
}: {
  extra: ExtraDraft;
  setExtra: (extra: ExtraDraft) => void;
}) => {
  const onChangePriceType = (newPriceType: ExtraPriceType) => {
    if (newPriceType === "per-hour") {
      setExtra({
        ...extra,
        type: newPriceType,
        fixedPrice: undefined,
        pricePax: undefined,
      });
    } else if (newPriceType === "per-person") {
      setExtra({
        ...extra,
        type: newPriceType,
        fixedPrice: undefined,
        priceHour: undefined,
      });
    } else if (newPriceType === "per-hour-and-person") {
      setExtra({
        ...extra,
        type: newPriceType,
        fixedPrice: undefined,
      });
    } else if (newPriceType === "fixed") {
      setExtra({
        ...extra,
        type: newPriceType,
        priceHour: undefined,
        pricePax: undefined,
      });
    }
  };

  return (
    <InputSelect
      value={extra.type}
      onChange={onChangePriceType}
      label="Tipo de preço"
      showLabel={false}
      options={EXTRA_PRICE_TYPES}
      className={element("price-type")}
    />
  );
};

const CellFixedPrice = ({
  extra,
  setExtra,
}: {
  extra: ExtraDraft;
  setExtra: (extra: ExtraDraft) => void;
}) => {
  if (extra.type !== "fixed") {
    return <div className={element("disabled")}>-</div>;
  }

  return (
    <InputNumber
      label="Valor fixo"
      showLabel={false}
      measure="€"
      value={extra.fixedPrice}
      onChange={(value) => setExtra({ ...extra, fixedPrice: value })}
      allowNegative={false}
      decimalScale={2}
      placeholder="0"
    />
  );
};

const CellPricePax = ({
  extra,
  setExtra,
}: {
  extra: ExtraDraft;
  setExtra: (extra: ExtraDraft) => void;
}) => {
  if (extra.type !== "per-hour-and-person" && extra.type !== "per-person") {
    return <div className={element("disabled")}>-</div>;
  }

  return (
    <InputNumber
      label="Valor por pessoa"
      showLabel={false}
      measure="€/p"
      value={extra.pricePax}
      onChange={(value) => setExtra({ ...extra, pricePax: value })}
      allowNegative={false}
      decimalScale={2}
      placeholder="0"
    />
  );
};

const CellPriceHour = ({
  extra,
  setExtra,
}: {
  extra: ExtraDraft;
  setExtra: (extra: ExtraDraft) => void;
}) => {
  if (extra.type !== "per-hour-and-person" && extra.type !== "per-hour") {
    return <div className={element("disabled")}>-</div>;
  }

  return (
    <InputNumber
      label="Valor por hora"
      showLabel={false}
      measure="€/h"
      value={extra.priceHour}
      onChange={(value) => setExtra({ ...extra, priceHour: value })}
      allowNegative={false}
      decimalScale={2}
      placeholder="0"
    />
  );
};

const CellMandatory = ({
  extra,
  setExtra,
}: {
  extra: ExtraDraft;
  setExtra: (extra: ExtraDraft) => void;
}) => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      style={{ height: "100%" }}
    >
      <InputCheckbox
        checked={extra.mandatory}
        onChange={(value) => setExtra({ ...extra, mandatory: value })}
      />
    </Stack>
  );
};

export type { ExtraDraft } from "./utils";

export default Extras;

const initialExtra = (): ExtraDraft => ({
  id: uuidv4(),
  type: "fixed",
  mandatory: false,
});

export const getExtrasError = (extras: ExtraDraft[]): string | undefined => {
  if (!extras.length) {
    return undefined;
  }

  const areExtrasValid = extras.every(
    (extra) =>
      !!extra.description &&
      (extra.type === "fixed"
        ? extra.fixedPrice !== undefined
        : extra.type === "per-hour"
          ? !!extra.priceHour
          : extra.type === "per-person"
            ? !!extra.pricePax
            : !!extra.priceHour && extra.pricePax),
  );

  if (!areExtrasValid) {
    return "Verifique os detalhes de todos os extras";
  }

  return undefined;
};
