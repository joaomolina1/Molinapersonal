"use client";

import Stack from "@/_design_system/Stack";
import { useSession } from "@/_services/session";
import { createBEMClasses } from "@/_utils/classname";
import Script from "next/script";
import { useEffect } from "react";

const { block, element } = createBEMClasses("contact-page");

const ContactsPage = () => {
  const [session] = useSession();

  useEffect(() => {
    if (window.Tally) {
      window.Tally.loadEmbeds();
    }
  }, [session]);

  const baseFormUrl =
    "https://tally.so/embed/3XGxLL?dynamicHeight=1&alignLeft=1";
  const formUrl = session
    ? `${baseFormUrl}&name=${session.name}&email=${session.email}`
    : baseFormUrl;

  return (
    <>
      <div className={block()}>
        <Stack gap="2rem" className={element("content")}>
          <Stack gap="1rem">
            <h1>Entre em contacto connosco</h1>
            <p>
              A RINU facilita a descoberta e reserva de espaços únicos para
              qualquer tipo de evento. Caso tenha perguntas, precisa de
              assistência para encontrar o espaço perfeito, ou deseja saber mais
              sobre a nossa plataforma, estamos aqui para ajudar!
            </p>
          </Stack>
          <div className={element("content__image")} />
        </Stack>
        <div className={element("form")}>
          <iframe
            title="Formulário de contacto"
            data-tally-src={formUrl}
            style={{ border: 0, height: "100%", width: "100%", margin: "-8px" }}
            key={session?.user_id}
          />
        </div>
      </div>
      <Script src="https://tally.so/widgets/embed.js" />
    </>
  );
};

export default ContactsPage;
