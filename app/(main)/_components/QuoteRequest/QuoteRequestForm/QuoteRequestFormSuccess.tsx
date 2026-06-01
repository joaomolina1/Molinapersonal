import IllustrationSuccess from "@/_design_system/_illustrations/Success.svg";
import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const { block, element } = createBEMClasses("quote-request-form-success");

export const QuoteRequestFormSuccess = ({
  type,
}: {
  type: "quote-request" | "contact-request";
}) => {
  const pathname = usePathname();

  useEffect(() => {
    if (type === "quote-request") {
      sendGAEvent("event", "Rinu_ScreenView", {
        Rinu_ScreenName: pathname,
        Rinu_ItemCategory: "enquire_request_sent",
        Rinu_ItemType: null,
      });
    }
  }, [pathname, type]);

  return (
    <main>
      <Stack gap="1.5rem" className={block()}>
        <div className={element("main")}>
          <IllustrationSuccess />
          <Stack gap="1rem">
            <p className={element("title")}>Pedido enviado com sucesso!</p>
            <p className={element("subtitle")}>Obrigado pelo seu pedido.</p>
          </Stack>
        </div>
        {type === "quote-request" ? (
          <p className={element("body")}>
            A nossa equipa vai analisá-lo com atenção e entraremos em contacto
            nas próximas horas com uma proposta à sua medida.
          </p>
        ) : (
          <p className={element("body")}>
            A nossa equipa vai analisá-lo com atenção para poder passá-lo ao
            espaço.
          </p>
        )}
      </Stack>
    </main>
  );
};
