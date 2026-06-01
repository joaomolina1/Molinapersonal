import Alert from "@/_design_system/Alert";
import InputText from "@/_design_system/InputText";
import Stack from "@/_design_system/Stack";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceMiscellaneousTip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tip.svg";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { ReactNode, useEffect, useRef } from "react";

export type VenueBilling = {
  name?: string;
  vat?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  iban?: string;
  email?: string;
  emailValid?: boolean;
};

const Billing = ({
  billing = {},
  setBilling,
  error,
  tip,
}: {
  billing?: VenueBilling;
  setBilling?: (billing: VenueBilling) => void;
  error?: string;
  tip: ReactNode;
}) => {
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (billing.emailValid === undefined) {
      setBilling?.({
        ...billing,
        emailValid: emailRef?.current?.checkValidity(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack gap="16px">
      <div className="hide-desktop-large">
        <TextBlock label="Indique os dados de faturação" />
      </div>
      <div className="hide-mobile-large">
        <TextBlock subtitle="Indique os dados de faturação" />
      </div>
      {!!error && <InputError error={error} />}
      <StackHalfHalf reverse>
        <Alert
          icon={<IconUserInterfaceMiscellaneousTip />}
          title="Dica"
          text={tip}
        />
        <Stack gap="16px" ariaLabel="Dados de faturação">
          <InputText
            label="Nome fiscal"
            showLabel={true}
            value={billing.name}
            onChange={(name) => setBilling?.({ ...billing, name })}
            autoComplete="name"
            invalid={!!error && !billing.name}
          />
          <InputText
            label="NIF"
            showLabel={true}
            value={billing.vat}
            onChange={(vat) => setBilling?.({ ...billing, vat })}
            format="### ### ###"
            invalid={!!error && !billing.vat}
          />
          <InputText
            label="Morada"
            showLabel={true}
            value={billing.address}
            onChange={(address) => setBilling?.({ ...billing, address })}
            autoComplete="billing street-address"
            invalid={!!error && !billing.address}
          />
          <StackHalfHalf>
            <InputText
              label="Código Postal"
              showLabel={true}
              value={billing.postalCode}
              onChange={(postalCode) =>
                setBilling?.({ ...billing, postalCode })
              }
              autoComplete="billing postal-code"
              invalid={!!error && !billing.postalCode}
            />
            <InputText
              label="Localidade"
              showLabel={true}
              value={billing.city}
              onChange={(city) => setBilling?.({ ...billing, city })}
              autoComplete="billing address-level1"
              invalid={!!error && !billing.city}
            />
          </StackHalfHalf>
          <InputText
            label="IBAN"
            showLabel={true}
            value={billing.iban}
            onChange={(iban) => setBilling?.({ ...billing, iban })}
            invalid={!!error && !billing.iban}
          />
          <InputText
            type="email"
            label="Email para envio da fatura"
            showLabel={true}
            value={billing.email}
            onChange={(email) =>
              setBilling?.({
                ...billing,
                email,
                emailValid: emailRef?.current?.checkValidity(),
              })
            }
            autoComplete="email"
            invalid={!!error && (!billing.email || !billing.emailValid)}
            ref={emailRef}
          />
        </Stack>
      </StackHalfHalf>
    </Stack>
  );
};

export default Billing;
