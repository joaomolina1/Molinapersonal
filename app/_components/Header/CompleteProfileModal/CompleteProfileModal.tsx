"use client";

import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import Logo from "@/_design_system/Logo";
import Button from "@/_design_system/Button";
import Card from "@/_design_system/Card";
import InputText from "@/_design_system/InputText";
import InputSelect from "@/_design_system/InputSelect";
import TextBlock from "@/_design_system/TextBlock";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { USER_KINDS, UserKind } from "@/_constants/space/userKinds";
import { useCompleteProfile, useSession } from "@/_services/session";
import { FormEvent, useEffect, useState } from "react";

const MONTHS: Record<number, string> = {
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
};

const CompleteProfileModal = () => {
  const [session] = useSession();
  const { mutateAsync: completeProfile, isPending } = useCompleteProfile();

  const [name, setName] = useState("");
  const [kind, setKind] = useState<UserKind>();
  const [monthOfBirth, setMonthOfBirth] = useState<string>();
  const [error, setError] = useState("");

  const isOpen =
    !!session &&
    session.profileComplete === false &&
    !session.roles.includes("admin");

  // Prefill the name with whatever Google provided when the modal opens.
  useEffect(() => {
    if (isOpen) setName((current) => current || session?.name || "");
  }, [isOpen, session?.name]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Por favor indique o seu nome.");
      return;
    }
    if (!kind) {
      setError("Por favor indique o tipo de registo.");
      return;
    }

    try {
      await completeProfile({
        name: name.trim(),
        kind,
        month_of_birth:
          kind === "individual" && monthOfBirth ? monthOfBirth : "",
      });
    } catch {
      setError("Não foi possível guardar. Tente novamente.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {}}
      width="medium"
      mobileHeight="fullscreen"
      ariaLabel="Completar perfil"
      isDismissable={false}
      showCloseButton={false}
    >
      <Stack gap="1.5rem">
        <div className="hide-desktop-large">
          <Logo type="default" link={false} />
        </div>
        <TextBlock
          subtitle="Falta só um passo"
          body="Para concluir o registo na RINU, indique como pretende usar a plataforma."
        />

        <form onSubmit={handleSubmit}>
          <Stack gap="1rem">
            <Stack gap="0.5rem">
              <h5>Indique o tipo de registo</h5>
              <div className="card-group card-group--three">
                {USER_KINDS.map((userKind) => (
                  <Card
                    key={userKind.id}
                    type="radio"
                    radioGroupName="complete-user-kind"
                    text={userKind.label}
                    microcopy={userKind.description}
                    checked={kind === userKind.id}
                    onChange={() => setKind(userKind.id)}
                  />
                ))}
              </div>
            </Stack>

            <Stack gap="0.5rem">
              <h5>Os seus dados</h5>
              <InputText label="Nome" value={name} onChange={setName} />
              {kind === "individual" && (
                <InputSelect
                  value={monthOfBirth}
                  onChange={setMonthOfBirth}
                  label="Mês de aniversário (opcional)"
                  options={[...Array(12).keys()].map((index) => ({
                    id: `${index + 1}`,
                    text: MONTHS[index + 1],
                  }))}
                  info="Usamos este campo apenas para estatísticas e para enviarmos oportunidades perto do seu aniversário."
                />
              )}
            </Stack>

            {!!error && <InputError error={error} />}

            <Button
              label="Concluir registo"
              type="primary"
              htmlType="submit"
              loading={isPending}
            />
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
};

export default CompleteProfileModal;
