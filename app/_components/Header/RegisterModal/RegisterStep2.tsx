import InputPassword from "@/_components/InputPassword";
import { USER_KINDS, UserKind } from "@/_constants/space/userKinds";
import Alert from "@/_design_system/Alert";
import Button, { TextButton } from "@/_design_system/Button";
import Card from "@/_design_system/Card";
import InputCheckbox from "@/_design_system/InputCheckbox";
import InputSelect from "@/_design_system/InputSelect";
import InputText from "@/_design_system/InputText";
import Stack from "@/_design_system/Stack";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import TextBlock from "@/_design_system/TextBlock";
import TextWithIcon from "@/_design_system/TextWithIcon";
import IconUserInterfaceFormsConfirm from "@/_design_system/_icons/UserInterface/Forms/Confirm.svg";
import InputWrapper, { InputError } from "@/_design_system/_utils/InputWrapper";
import { useRegister } from "@/_services/session";
import config from "@/_utils/config";
import { FormEvent, useRef, useState } from "react";

const RegisterStep2 = ({
  email,
  setEmail,
  code,
  onSuccess,
  loginHref,
  onClick,
}: {
  email: string;
  setEmail: (email: string) => void;
  code: string;
  onSuccess: () => void;
  loginHref: string;
  onClick: () => void;
}) => {
  const [kind, setKind] = useState<UserKind>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [monthOfBirth, setMonthOfBirth] = useState<string>();
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [kindError, setKindError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [repeatPasswordError, setRepeatPasswordError] = useState("");
  const [acceptTermsError, setAcceptTermsError] = useState("");

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const repeatPasswordRef = useRef<HTMLInputElement>(null);

  const {
    mutateAsync: register,
    isPending: isPendingRegister,
    isError: isErrorRegister,
    reset: resetRegister,
  } = useRegister();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    setKindError("");
    setEmailError("");
    setPasswordError("");
    setRepeatPasswordError("");
    resetRegister();

    if (!firstName) {
      firstNameRef.current?.focus();
      return;
    }

    if (!lastName) {
      lastNameRef.current?.focus();
      return;
    }

    if (!email) {
      emailRef.current?.focus();
      return;
    }

    if (!password) {
      passwordRef.current?.focus();
      return;
    }

    if (!repeatPassword) {
      repeatPasswordRef.current?.focus();
      return;
    }

    if (!passwordIsValid(password)) {
      passwordRef.current?.focus();
      setPasswordError("Palavra-passe inválida.");
      return;
    }

    if (repeatPassword !== password) {
      repeatPasswordRef.current?.focus();
      setRepeatPasswordError("As palavras-passe são diferentes.");
      return;
    }

    if (!kind) {
      setKindError("Por favor indique o tipo de registo.");
      return;
    }

    if (!acceptTerms) {
      setAcceptTermsError("Por favor leia e aceite os termos e condições.");
      return;
    }

    try {
      await register({
        name: `${firstName} ${lastName}`,
        username: email,
        password,
        code: config.enableInviteCode ? code : undefined,
        role: USER_KINDS.find((k) => k.id === kind)!.userRole,
        kind,
        month_of_birth:
          kind === "individual" && monthOfBirth ? monthOfBirth : "",
      });

      onSuccess();
    } catch (e) {
      if ((e as Error).message.includes("existing_username")) {
        setEmailError("O email que introduziu já está registado.");
        resetRegister();
      } else {
        throw e;
      }
    }
  };

  return (
    <Stack gap="1.5rem">
      <TextBlock subtitle="Complete o registo" />
      <form
        onSubmit={(e) => {
          handleRegister(e);
        }}
      >
        <Stack gap="1rem">
          <Stack gap="0.5rem">
            <h5>Indique o tipo de registo</h5>
            <div
              className="card-group card-group--three"
              aria-label="Privacidade do espaço"
            >
              {USER_KINDS.map((userKind) => (
                <Card
                  key={userKind.id}
                  type="radio"
                  radioGroupName="user-kind"
                  text={userKind.label}
                  microcopy={userKind.description}
                  checked={kind === userKind.id}
                  onChange={() => setKind(userKind.id)}
                />
              ))}
            </div>
            {!!kindError && <InputError error={kindError} />}
          </Stack>
          <Stack gap="0.5rem">
            <h5>Indique os seus dados pessoais</h5>
            <StackHalfHalf gap="0.5rem" applyOnMobile>
              <InputText
                label="Nome"
                value={firstName}
                onChange={setFirstName}
                ref={firstNameRef}
              />
              <InputText
                label="Apelido"
                value={lastName}
                onChange={setLastName}
                ref={lastNameRef}
              />
            </StackHalfHalf>
            {kind === "individual" && (
              <StackHalfHalf gap="0.5rem" rightEmpty>
                <InputSelect
                  value={monthOfBirth}
                  onChange={setMonthOfBirth}
                  label="Mês de aniversário (opcional)"
                  options={[...Array(12).keys()].map((index) => ({
                    id: `${index + 1}`,
                    text: {
                      1: "Janeiro",
                      2: "Fevereiro",
                      3: "Março",
                      4: "Abril",
                      5: "Maio",
                      6: "Junho",
                      7: "Julho",
                      8: "Agosto",
                      9: "Setembro",
                      10: "Outubro",
                      11: "Novembro",
                      12: "Dezembro",
                    }[index + 1],
                  }))}
                  info="Usamos este campo apenas para estatísticas e para enviarmos oportunidades perto do seu aniversário."
                />
              </StackHalfHalf>
            )}
          </Stack>
          <Stack gap="0.5rem">
            <h5>Indique os seus dados de login</h5>
            <InputText
              label="Email"
              type="email"
              value={email}
              onChange={(value) => {
                setEmail(value);

                if (emailError) {
                  setEmailError("");
                }
              }}
              ref={emailRef}
              error={emailError}
              autoComplete="email"
            />
            <StackHalfHalf gap="0.5rem">
              <InputPassword
                label="Palavra-passe"
                value={password}
                onChange={(value) => {
                  if (!passwordIsValid(password) && passwordIsValid(value)) {
                    setPasswordError("");
                  }

                  if (repeatPasswordError && value === repeatPassword) {
                    setRepeatPasswordError("");
                  }

                  setPassword(value);
                }}
                ref={passwordRef}
                error={passwordError}
                autoComplete="new-password"
              />
              <InputPassword
                label="Repetir palavra-passe"
                value={repeatPassword}
                onChange={(value) => {
                  setRepeatPassword(value);

                  if (repeatPasswordError && value === password) {
                    setRepeatPasswordError("");
                  }
                }}
                ref={repeatPasswordRef}
                error={repeatPasswordError}
                autoComplete="new-password"
              />
            </StackHalfHalf>
            <PasswordChecks password={password} />
          </Stack>
          <InputWrapper error={acceptTermsError}>
            <Stack row gap="1rem" flexWrap="nowrap">
              <InputCheckbox
                checked={acceptTerms}
                onChange={(checked) => {
                  setAcceptTerms(checked);

                  if (acceptTermsError && checked) {
                    setAcceptTermsError("");
                  }
                }}
                ariaLabel="Li e aceito os termos e condições"
              />
              <p className="terms-conditions">
                Declaro que li e aceito os{" "}
                <TextButton
                  target="_blank"
                  href="/TermosRINU.pdf"
                  text="Termos e condições"
                  prefetch={false}
                />
              </p>
            </Stack>
          </InputWrapper>
          {isErrorRegister && (
            <InputError error="Ocorreu um erro ao registar" />
          )}
          <Button
            label="Registar"
            type="primary"
            htmlType="submit"
            loading={isPendingRegister}
            onClick={onClick}
          />
        </Stack>
      </form>
      <Stack
        row
        alignItems="center"
        justifyContent="center"
        gap="0.375rem"
        className="session-modal-switch"
      >
        Já tem conta?
        <TextButton text="Entrar" href={loginHref} prefetch={false} />
      </Stack>
    </Stack>
  );
};

export const PasswordChecks = ({ password }: { password: string }) => (
  <Alert
    title="A palavra-passe deve conter"
    content={
      <ul className="password-checklist">
        <li>
          <TextWithIcon
            icon={
              <IconUserInterfaceFormsConfirm
                on={passwordHasMinLength(password)}
              />
            }
            text="Mínimo de 10 caracteres"
          />
        </li>
      </ul>
    }
  />
);

const passwordHasMinLength = (password: string) => password.length >= 10;

export const passwordIsValid = (password: string) =>
  passwordHasMinLength(password);

export default RegisterStep2;
