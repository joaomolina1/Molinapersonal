"use client";

import Alert from "@/_design_system/Alert";
import Card from "@/_design_system/Card";
import InputPhone, { isValidPhone } from "@/_design_system/InputPhone";
import InputText from "@/_design_system/InputText";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceMiscellaneousTip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tip.svg";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useState } from "react";
import InputSelect from "@/_design_system/InputSelect";
import { COUNTRIES } from "@/_constants/booking/countries";
import { useSession } from "@/_services/session";
import { Booking } from "@/_models/booking";
import { useScrollIntoView } from "@/_utils/scrollIntoView";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import IllustrationCardTypes from "@/_design_system/_illustrations/CardTypes.svg";
import IllustrationCardTypes2 from "@/_design_system/_illustrations/CardTypes2.svg";
import IconUserInterfaceMiscellaneousSeparatorBar from "@/_design_system/_icons/UserInterface/Miscellaneous/SeparatorBar.svg";

const { block, element } = createBEMClasses("draft-booking-form");

const PAYMENT_METHODS = [
  {
    id: "card",
    icon: (
      <Stack row gap="0.5rem" alignItems="center">
        <IllustrationCardTypes />
        <IconUserInterfaceMiscellaneousSeparatorBar />
        <IllustrationCardTypes2 />
      </Stack>
    ),
    label: "Cartão de crédito ou débito",
  },
] as const;

const countryOptions = COUNTRIES.map((country) => ({
  id: country,
  text: country,
}));

type PaymentMethod = (typeof PAYMENT_METHODS)[number]["id"];

export const useDraftBookingFormState = (booking?: Booking) => {
  const [phone, setPhone] = useState<{ extension?: number; number?: number }>({
    extension: booking?.contactPhoneExtension || undefined,
    number: booking?.contactPhoneNumber || undefined,
  });
  const [country, setCountry] = useState(booking?.billingCountry || "Portugal");
  const [name, setName] = useState(booking?.billingName ?? "");
  const [vat, setVat] = useState(booking?.billingVAT ?? "");
  const [address, setAddress] = useState(booking?.billingAddress ?? "");
  const [zip, setZip] = useState(booking?.billingPostCode ?? "");
  const [city, setCity] = useState(booking?.billingCity ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  const [contactRef, contactScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [billingRef, billingScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [paymentRef, paymentScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();

  const [showErrors, setShowErrors] = useState(false);

  const contactError =
    !phone.extension || !phone.number
      ? "Por favor insira um telemóvel"
      : !isValidPhone(phone)
        ? "Por favor insira um telemóvel válido"
        : undefined;

  const ptVatRegex = new RegExp(/\d{9}/g);
  const unformattedVat = vat.replace(/\s/g, "");
  const vatInvalid =
    country === "Portugal" &&
    !!unformattedVat &&
    !ptVatRegex.test(unformattedVat);

  const ptZipRegex = new RegExp(/\d{7}/g);
  const unformattedZip = zip.replace(/\s/g, "");
  const zipInvalid =
    country === "Portugal" &&
    !!unformattedZip &&
    !ptZipRegex.test(unformattedZip);

  const billingError =
    !country || !name || !vat || !address || !zip || !city
      ? "Por favor preencha todos os campos"
      : vatInvalid
        ? "Por favor insira um NIF válido"
        : zipInvalid
          ? "Por favor insira um código postal válido"
          : undefined;

  const paymentError = !paymentMethod
    ? "Por favor escolha um método de pagamento"
    : undefined;

  return {
    phone,
    setPhone,
    country,
    setCountry,
    name,
    setName,
    vat,
    setVat,
    unformattedVat,
    vatInvalid,
    address,
    setAddress,
    zip,
    setZip,
    unformattedZip,
    zipInvalid,
    city,
    setCity,
    paymentMethod,
    setPaymentMethod,
    contactRef,
    contactScrollIntoView,
    contactError,
    billingRef,
    billingScrollIntoView,
    billingError,
    paymentRef,
    paymentScrollIntoView,
    paymentError,
    showErrors,
    setShowErrors,
    hasErrors: !!contactError || !!billingError || !!paymentError,
  };
};

type DraftBookingFormState = ReturnType<typeof useDraftBookingFormState>;

const DraftBookingForm = ({
  state,
  disabled,
}: {
  state: DraftBookingFormState;
  disabled: boolean;
}) => {
  const [session] = useSession();

  return (
    <div className={block()}>
      <div className={element("section")} ref={state.contactRef}>
        <DraftBookingFormSectionTitle
          title="Indique o seu contacto"
          subtitle="Indique o telefone para o qual deve ser contactado sobre esta reserva"
        />
        <Stack gap="1rem">
          <InputText label="Nome" value={session?.name ?? ""} disabled />
          <InputText label="Email" value={session?.email ?? ""} disabled />
          <InputPhone
            extension={state.phone.extension}
            number={state.phone.number}
            onChange={(extension, number) =>
              state.setPhone({ extension, number })
            }
            error={state.showErrors ? state.contactError : undefined}
            disabled={disabled}
          />
        </Stack>
      </div>
      <div className={element("section")} ref={state.billingRef}>
        <DraftBookingFormSectionTitle
          title="Indique os dados de faturação"
          tip="O envio da fatura do seu evento ficará a cargo do proprietário do espaço. Indique os dados que quer que sejam emitidos na mesma. Se quiser que a fatura contenha mais algum dado entre em contacto com os serviços após a reserva."
        />
        {state.showErrors && state.billingError && (
          <InputError error={state.billingError} />
        )}
        <Stack gap="1rem">
          <InputSelect
            label="País"
            value={state.country}
            onChange={(newCountry) => {
              state.setCountry(newCountry);
              state.setVat("");
              state.setZip("");
            }}
            options={countryOptions}
            invalid={state.showErrors && !state.country}
            disabled={disabled}
          />
          <InputText
            label="Nome fiscal"
            value={state.name}
            onChange={state.setName}
            invalid={state.showErrors && !state.name}
            disabled={disabled}
            autoComplete="name"
          />
          <InputText
            label="NIF"
            value={state.vat}
            onChange={state.setVat}
            format={state.country === "Portugal" ? "### ### ###" : undefined}
            invalid={state.showErrors && (!state.vat || state.vatInvalid)}
            disabled={disabled}
          />
          <InputText
            label="Morada"
            value={state.address}
            onChange={state.setAddress}
            invalid={state.showErrors && !state.address}
            disabled={disabled}
            autoComplete="billing street-address"
          />
          <Stack row gap="1rem">
            <InputText
              label="Código postal"
              value={state.zip}
              onChange={state.setZip}
              style={{ flex: 1 }}
              format={state.country === "Portugal" ? "#### ###" : undefined}
              invalid={state.showErrors && (!state.zip || state.zipInvalid)}
              disabled={disabled}
              autoComplete="billing postal-code"
            />
            <InputText
              label="Localidade"
              value={state.city}
              onChange={state.setCity}
              style={{ flex: 1 }}
              invalid={state.showErrors && !state.city}
              disabled={disabled}
              autoComplete="billing address-level1"
            />
          </Stack>
        </Stack>
      </div>
      <div className={element("section")} ref={state.paymentRef}>
        <DraftBookingFormSectionTitle title="Escolha o método de pagamento" />
        {state.showErrors && state.paymentError && (
          <InputError error={state.paymentError} />
        )}
        <div className={element("payment-method")}>
          {PAYMENT_METHODS.map((method) => (
            <Card
              key={method.id}
              type="radio"
              radioGroupName="payment-method"
              checked={state.paymentMethod === method.id}
              onChange={() => state.setPaymentMethod(method.id)}
              variant="large-icon"
            >
              <div className={element("payment-method__option")}>
                <div className={element("payment-method__option__icon")}>
                  {method.icon}
                </div>
                <span className={element("payment-method__option__label")}>
                  {method.label}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const DraftBookingFormSectionTitle = ({
  title,
  subtitle,
  tip,
}: {
  title: string;
  subtitle?: string;
  tip?: string;
}) => {
  const isMobile = useMediaQuery("large");

  return (
    <Stack gap="1rem">
      <TextBlock
        label={isMobile ? title : undefined}
        subtitle={isMobile ? undefined : title}
        body={subtitle}
      />
      {!!tip && (
        <Alert
          icon={<IconUserInterfaceMiscellaneousTip />}
          title="Dica"
          text={tip}
        />
      )}
    </Stack>
  );
};

export default DraftBookingForm;
