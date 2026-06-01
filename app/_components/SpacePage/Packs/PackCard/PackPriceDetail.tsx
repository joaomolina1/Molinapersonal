import { CalculatedPrice } from "@/_models/pack";
import { createBEMClasses } from "@/_utils/classname";
import { TimeDuration, formatMoney, formatPercentage } from "@/_utils/number";
import { Fragment } from "react";

const { block, element } = createBEMClasses("client-pack-price-detail");

type FormattedSchedule = CalculatedPrice["schedules"][number] & {
  start: TimeDuration;
  end: TimeDuration;
};

const PackPriceDetail = ({
  price,
  start,
  showLabel,
  showTotal,
}: {
  price: CalculatedPrice;
  start?: TimeDuration;
  showLabel?: boolean;
  showTotal?: boolean;
}) => {
  if (!start) {
    return;
  }

  const hasManySchedules = price.schedules.length > 1;
  const hasRatioPax = price.schedules.some((schedule) => !!schedule.ratioPax);

  const formattedSchedules = price.schedules.reduce((acc, schedule, index) => {
    const scheduleStart = index === 0 ? start : acc[index - 1].end;

    const scheduleEnd = TimeDuration.fromNumber(
      scheduleStart.number + (schedule.duration?.number ?? 0),
    );

    const formattedSchedule = {
      ...schedule,
      start: scheduleStart,
      end: scheduleEnd,
    };

    acc.push(formattedSchedule);

    return acc;
  }, [] as FormattedSchedule[]);

  return (
    <div className={block()}>
      {showLabel && <p className={element("title")}>Detalhes do pagamento</p>}
      {formattedSchedules.map((schedule, index) => {
        const hasMinValue = schedule.minValue > schedule.value;

        return (
          <Fragment key={index}>
            {!!schedule.valuePax && (
              <ValuePaxLine
                valuePax={schedule.valuePax}
                pax={schedule.pax}
                ratioPax={schedule.ratioPax}
                inactive={hasMinValue}
              />
            )}
            {!!schedule.valueHour && (
              <ValueHourLine
                valueHour={schedule.valueHour}
                duration={schedule.duration?.number ?? 0}
                inactive={hasMinValue}
              />
            )}
            {hasManySchedules && (
              <StartEndLine start={schedule.start} end={schedule.end} />
            )}
            {hasMinValue && <MinValueLine minValue={schedule.minValue} />}
          </Fragment>
        );
      })}
      {hasRatioPax && <RatioPaxLine />}
      {price.timeOverflow && <TimeOverflowLine />}
      {price.extras.map((extra) => (
        <Line key={extra.id} label={extra.description} value={extra.value} />
      ))}
      {showTotal && (
        <>
          <hr />
          <>
            <span className={element("label")}>Total c/ IVA</span>
            <span className={element("total")}>{formatMoney(price.value)}</span>
          </>
        </>
      )}
    </div>
  );
};

const ValuePaxLine = ({
  valuePax,
  pax,
  ratioPax,
  inactive,
}: {
  valuePax: number;
  pax: number;
  ratioPax: number | null;
  inactive: boolean;
}) => {
  const multiplyLabel = `${formatMoney(valuePax)} x ${pax} ${
    pax === 1 ? "pessoa" : "pessoas"
  }`;

  const ratioLabel = formatPercentage(ratioPax);

  const label = ratioPax ? `(${multiplyLabel}) x ${ratioLabel}` : multiplyLabel;

  return (
    <Line
      label={label}
      value={valuePax * pax * (ratioPax ?? 1)}
      inactive={inactive}
    />
  );
};

const ValueHourLine = ({
  valueHour,
  duration,
  inactive,
}: {
  valueHour: number;
  duration: number;
  inactive: boolean;
}) => {
  return (
    <Line
      label={`${formatMoney(valueHour)} x ${duration} ${
        duration === 1 ? "hora" : "horas"
      }`}
      value={valueHour * duration}
      inactive={inactive}
    />
  );
};

const MinValueLine = ({ minValue }: { minValue: number }) => {
  return (
    <>
      <Line label="Gasto mínimo" value={minValue} />
      <p className={element("detail")}>
        Este pack exige um gasto mínimo de {formatMoney(minValue)}.
      </p>
    </>
  );
};

const StartEndLine = ({
  start,
  end,
}: {
  start: TimeDuration;
  end: TimeDuration;
}) => {
  return (
    <p className={element("detail")}>
      Valor das {start.timeLabel} às {end.timeLabel}
    </p>
  );
};

const TimeOverflowLine = () => {
  return (
    <>
      <Line label="Pack com duração máxima" />
      <p className={element("detail")}>
        Este pack tem um número máximo de horas inferior ao pretendido e o preço
        apresentado é referente às horas máximas permitidas
      </p>
    </>
  );
};

const RatioPaxLine = () => {
  return (
    <>
      <Line label="Ajuste proporcional" />
      <p className={element("detail")}>
        Quando um espaço apresenta preços diferentes para horas diferentes,
        ajustamos o preço final pela proporção das horas
      </p>
    </>
  );
};

const Line = ({
  label,
  value,
  inactive = false,
}: {
  label: string;
  value?: number;
  inactive?: boolean;
}) => {
  return (
    <>
      <span className={element("label")}>{label}</span>
      {value && (
        <span className={element("value", { inactive })}>
          {formatMoney(value)}
        </span>
      )}
    </>
  );
};

export default PackPriceDetail;
