const PackCancellationLabel = ({
  cancellation,
  withBold,
  className,
}: {
  cancellation: string;
  withBold?: boolean;
  className?: string;
}) => {
  const value = parseInt(cancellation.slice(0, -1));
  const unit =
    cancellation.slice(-1) === "h"
      ? value === 1
        ? "hora"
        : "horas"
      : value === 1
        ? "dia"
        : "dias";

  const textValue = `${value} ${unit}`;

  if (withBold) {
    return (
      <p className={className}>
        <b>{textValue}</b> de antecedência receberão reembolso total.
        <br />
        <b>Menos de {textValue}</b> não são reembolsáveis.
      </p>
    );
  }

  return (
    <p className={className}>
      {textValue} de antecedência receberão reembolso total.
      <br />
      Menos de {textValue} não são reembolsáveis.
    </p>
  );
};

export default PackCancellationLabel;
