"use client";

import Button from "@/_design_system/Button";
import { useSession } from "@/_services/session";
import { useTallyFormModal } from "@/_utils/tally";
import Script from "next/script";

const ScheduleDemoButton = () => {
  const [session] = useSession();

  const openForm = useTallyFormModal("mYOgRv", {
    name: session?.name,
    email: session?.email,
  });

  return (
    <>
      <Button
        type="secondary"
        label="Agendar demonstração"
        onClick={openForm}
      />
      <Script src="https://tally.so/widgets/embed.js" />
    </>
  );
};

export default ScheduleDemoButton;
