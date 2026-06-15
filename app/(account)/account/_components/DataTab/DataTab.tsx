"use client";

import InputText from "@/_design_system/InputText";
import InputDate from "@/_design_system/InputDate";
import InputPhone from "@/_design_system/InputPhone";
import Button from "@/_design_system/Button";
import Avatar from "@/_design_system/Avatar";
import Stack from "@/_design_system/Stack";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import TextBlock from "@/_design_system/TextBlock";
import { useShowToast } from "@/_design_system/Toast";
import { useSession } from "@/_services/session";
import {
  useMyProfile,
  useUpdateProfile,
  useUploadAvatar,
} from "@/_models/profile";
import { createBEMClasses } from "@/_utils/classname";
import { CalendarDate, parseDate } from "@internationalized/date";
import { useEffect, useRef, useState } from "react";

const { block, element } = createBEMClasses("account-data-tab");

function safeParseDate(value: string): CalendarDate | null {
  try {
    return parseDate(value.slice(0, 10));
  } catch {
    return null;
  }
}

const DataTab = () => {
  const [session, setSession] = useSession();
  const { data: profile } = useMyProfile();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState<{ extension?: number; number?: number }>(
    {},
  );
  const [dateOfBirth, setDateOfBirth] = useState<CalendarDate | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setPhone({
      extension: profile.phoneExtension ?? undefined,
      number: profile.phoneNumber ?? undefined,
    });
    setPhotoURL(profile.photoURL);
    setDateOfBirth(
      profile.dateOfBirth ? safeParseDate(profile.dateOfBirth) : null,
    );
  }, [profile]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: updateProfile, isPending: isSaving } =
    useUpdateProfile();
  const { mutateAsync: uploadAvatar, isPending: isUploading } =
    useUploadAvatar();
  const showToast = useShowToast();

  const handleSave = async () => {
    try {
      await updateProfile({
        name: name.trim(),
        phoneExtension: phone.extension ?? null,
        phoneNumber: phone.number ?? null,
        dateOfBirth: dateOfBirth ? dateOfBirth.toString() : null,
      });
      if (session) setSession({ ...session, name: name.trim() });
      showToast({ text: "Dados atualizados com sucesso" });
    } catch {
      showToast({ text: "Ocorreu um erro ao guardar os dados" });
    }
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const { photoURL: uploadedURL } = await uploadAvatar({ file });
      setPhotoURL(uploadedURL);
      if (session) setSession({ ...session, photoURL: uploadedURL });
      showToast({ text: "Foto atualizada com sucesso" });
    } catch {
      showToast({ text: "Ocorreu um erro ao carregar a foto" });
    }
  };

  return (
    <div className={block()}>
      <div className="hide-mobile-large">
        <TextBlock title="Os meus dados pessoais" />
      </div>
      <div className="hide-desktop-large">
        <TextBlock subtitle="Os meus dados pessoais" />
      </div>
      <div className={element("content")}>
        <Stack gap="1.5rem" alignItems="flex-start">
          <Stack row gap="1rem" alignItems="center">
            <Avatar
              name={name || session?.name}
              url={photoURL ?? undefined}
              size="large"
            />
            <Stack gap="0.5rem" alignItems="flex-start">
              <Button
                type="secondary"
                label="Carregar foto"
                loading={isUploading}
                onClick={() => fileInputRef.current?.click()}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
              />
            </Stack>
          </Stack>

          <StackHalfHalf gap="1rem">
            <InputText label="Nome" value={name} onChange={setName} />
            <InputText label="Email" value={session?.email} disabled />
          </StackHalfHalf>
          <StackHalfHalf gap="1rem">
            <InputPhone
              optional
              extension={phone.extension}
              number={phone.number}
              onChange={(extension, number) => setPhone({ extension, number })}
            />
            <InputDate
              label="Data de nascimento"
              value={dateOfBirth}
              onChange={setDateOfBirth}
            />
          </StackHalfHalf>

          <Button
            type="primary"
            label="Guardar alterações"
            loading={isSaving}
            onClick={() => void handleSave()}
          />
        </Stack>
      </div>
    </div>
  );
};

export default DataTab;
