import Alert from "@/_design_system/Alert";
import InputPhone, { isValidPhone } from "@/_design_system/InputPhone";
import InputText from "@/_design_system/InputText";
import Stack from "@/_design_system/Stack";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceMiscellaneousTip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tip.svg";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { ReactNode, useEffect, useRef } from "react";

export type VenueContact = {
  name?: string;
  phoneExtension?: number;
  phoneNumber?: number;
  email?: string;
  emailValid?: boolean;
};

const Contact = ({
  contact = {},
  setContact,
  error,
  label,
  tip,
}: {
  contact?: VenueContact;
  setContact?: (contact: VenueContact) => void;
  error?: string;
  label: ReactNode;
  tip: ReactNode;
}) => {
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (contact.emailValid === undefined) {
      setContact?.({
        ...contact,
        emailValid: emailRef?.current?.checkValidity(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack gap="16px">
      <div className="hide-desktop-large">
        <TextBlock label={label} />
      </div>
      <div className="hide-mobile-large">
        <TextBlock subtitle={label} />
      </div>
      {!!error && <InputError error={error} />}
      <StackHalfHalf reverse>
        <Alert
          icon={<IconUserInterfaceMiscellaneousTip />}
          title="Dica"
          text={tip}
        />
        <Stack gap="16px" ariaLabel="Dados da pessoa responsável">
          <InputText
            label="Nome"
            showLabel={true}
            value={contact.name}
            onChange={(name) => setContact?.({ ...contact, name })}
            autoComplete="name"
            invalid={!!error && !contact.name}
          />
          <InputPhone
            extension={contact.phoneExtension}
            number={contact.phoneNumber}
            onChange={(extension, number) =>
              setContact?.({
                ...contact,
                phoneExtension: extension,
                phoneNumber: number,
              })
            }
            invalid={
              !!error &&
              !isValidPhone({
                extension: contact.phoneExtension,
                number: contact.phoneNumber,
              })
            }
          />
          <InputText
            type="email"
            label="Email"
            showLabel={true}
            value={contact.email}
            onChange={(email) =>
              setContact?.({
                ...contact,
                email,
                emailValid: emailRef?.current?.checkValidity(),
              })
            }
            autoComplete="email"
            invalid={!!error && (!contact.email || !contact.emailValid)}
            ref={emailRef}
          />
        </Stack>
      </StackHalfHalf>
    </Stack>
  );
};

export default Contact;
