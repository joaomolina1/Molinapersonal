"use client";

import { useState } from "react";
import RegisterStep1 from "./RegisterStep1";
import RegisterStep2 from "./RegisterStep2";
import RegisterStep3 from "./RegisterStep3";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import Logo from "@/_design_system/Logo";
import { IconButton } from "@/_design_system/Button";
import IconUserInterfaceActionsClose from "@/_design_system/_icons/UserInterface/Actions/Close.svg";
import RegisterStep0 from "./RegisterStep0";
import IconUserInterfaceNavigationArrowLeft from "@/_design_system/_icons/UserInterface/Navigation/ArrowLeft.svg";
import config from "@/_utils/config";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { useMediaQuery } from "@/_utils/mediaQuery";

const RegisterModal = ({
  isOpen,
  onOpenChange,
  loginHref,
  source,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  loginHref: string;
  source: string | null;
}) => {
  const isMobile = useMediaQuery("large");

  const initialStep = config.enableInviteCode ? 0 : 2;

  const [step, setStep] = useState(initialStep);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const handleOpenChange = (newIsOpen: boolean) => {
    onOpenChange(newIsOpen);

    if (!newIsOpen) {
      // Wait for the modal exiting animation to finish
      setTimeout(() => {
        setStep(initialStep);
        setEmail("");
      }, 1000);
    }
  };

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const onRegister = (itemType: string) => {
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
      onOpenChange={handleOpenChange}
      width="medium"
      mobileHeight="fullscreen"
      ariaLabel="Registar"
      isDismissable={false}
      showCloseButton={false}
    >
      <Stack
        gap={isMobile ? "1rem" : "0"}
        style={isMobile ? { paddingBottom: "1.5rem" } : undefined}
      >
        <Stack row justifyContent="space-between" alignItems="center">
          <div className="hide-desktop-large">
            <Logo type="default" link />
          </div>
          {step === 0 && (
            <div className="hide-mobile-large">
              <IconButton
                ariaLabel="Voltar"
                href={loginHref}
                icon={<IconUserInterfaceNavigationArrowLeft />}
                prefetch={false}
              />
            </div>
          )}
          <IconButton
            ariaLabel="Fechar"
            onClick={() => handleOpenChange(false)}
            icon={<IconUserInterfaceActionsClose />}
            style={{ marginLeft: "auto" }}
          />
        </Stack>
        {step === 0 && (
          <RegisterStep0
            onContinue={() => setStep(2)}
            code={code}
            setCode={setCode}
          />
        )}
        {/*eslint-disable-next-line no-constant-binary-expression */}
        {false && (
          <RegisterStep1
            loginHref={loginHref}
            email={email}
            setEmail={setEmail}
            onContinue={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <RegisterStep2
            email={email}
            setEmail={setEmail}
            code={code}
            onSuccess={() => setStep(3)}
            loginHref={loginHref}
            onClick={() => onRegister("register")}
          />
        )}
        {step === 3 && (
          <RegisterStep3
            email={email}
            onClose={() => handleOpenChange(false)}
          />
        )}
      </Stack>
    </Modal>
  );
};

export default RegisterModal;
