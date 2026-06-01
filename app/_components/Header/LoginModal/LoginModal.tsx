"use client";

import InputPassword from "@/_components/InputPassword";
import Button, { IconButton, TextButton } from "@/_design_system/Button";
import InputText from "@/_design_system/InputText";
import Logo from "@/_design_system/Logo";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceActionsClose from "@/_design_system/_icons/UserInterface/Actions/Close.svg";
import { useLogin } from "@/_services/session";
import { sendGAEvent } from "@next/third-parties/google";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

const LoginModal = ({
  isOpen,
  onOpenChange,
  registerHref,
  requestResetPasswordHref,
  source,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  registerHref: string;
  requestResetPasswordHref: string;
  source: string | null;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const {
    mutateAsync: login,
    isPending: isPendingLogin,
    isError: isErrorLogin,
  } = useLogin();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();

    if (!email) {
      emailRef.current?.focus();
      return;
    }

    if (!password) {
      passwordRef.current?.focus();
      return;
    }

    login({ username: email, password })
      .then(() => {
        setEmail("");
        setPassword("");
        onOpenChange(false);
      })
      .catch((e: Error) => {
        // Ignore 401 error from invalid email/password
        if (!e.message.includes("401")) {
          throw e;
        }
      });
  };

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const handleLogInModalClicks = (itemType: string) => {
    let screenName = pathname;
    let eLabel2: string | null = null;
    if (pathname.includes("/space/")) {
      screenName = "/space";
      eLabel2 = params.spaceID as string;
    } else if (pathname === "/space") {
      screenName = "/space";
      eLabel2 = searchParams.get("spaceID");
    }
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: screenName,
      Rinu_ItemCategory: source,
      Rinu_ItemType: itemType,
      Rinu_eLabel2: eLabel2,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      width="medium"
      mobileHeight="fullscreen"
      ariaLabel="Entrar"
      isDismissable={false}
      showCloseButton={false}
    >
      <Stack gap="2.5rem" style={{ paddingBottom: "2.5rem" }}>
        <Stack row justifyContent="space-between" alignItems="center">
          <div className="hide-desktop-large">
            <Logo type="default" link />
          </div>
          <IconButton
            ariaLabel="Fechar"
            onClick={() => onOpenChange(false)}
            icon={<IconUserInterfaceActionsClose />}
            style={{ marginLeft: "auto" }}
          />
        </Stack>
        {source === "show-price" ? (
          <TextBlock
            subtitle="Bem vindo(a) à comunidade RINU"
            body="Para lhe podermos mostrar o preço deste pack, precisamos que se registe na nossa plataforma."
          />
        ) : (
          <TextBlock
            subtitle="Bem vindo(a) à RINU"
            body="Entrar na sua conta"
          />
        )}
        <form onSubmit={handleLogin}>
          <Stack gap="1rem">
            <InputText
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              ref={emailRef}
              invalid={isErrorLogin}
              autoComplete="email"
            />
            <InputPassword
              label="Palavra-passe"
              value={password}
              onChange={setPassword}
              ref={passwordRef}
              error={isErrorLogin ? "Email ou palavra-passe inválidos" : ""}
              autoComplete="current-password"
            />
            <div>
              <TextButton
                text="Recuperar palavra-passe"
                href={requestResetPasswordHref}
                prefetch={false}
              />
            </div>
            <Button
              label="Entrar"
              type="primary"
              htmlType="submit"
              loading={isPendingLogin}
              onClick={() => handleLogInModalClicks("login")}
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
          Ainda não tem conta?
          <TextButton
            text="Criar conta"
            href={registerHref}
            prefetch={false}
            onClick={() => handleLogInModalClicks("createAccount")}
          />
        </Stack>
      </Stack>
    </Modal>
  );
};

export default LoginModal;
