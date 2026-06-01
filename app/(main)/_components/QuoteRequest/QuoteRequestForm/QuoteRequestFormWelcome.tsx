import IconUserInterfaceNavigationArrowRight from "@/_design_system/_icons/UserInterface/Navigation/ArrowRight.svg";
import Button from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { createBEMClasses } from "@/_utils/classname";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";

const { block, element } = createBEMClasses("quote-request-form-welcome");

export const QuoteRequestFormWelcome = ({
  onRequestQuote,
}: {
  onRequestQuote: () => void;
}) => {
  const pathname = usePathname();

  return (
    <main>
      <Stack gap="1.5rem" className={block()}>
        <TextBlock
          subtitle="Podemos ajudar? 👋"
          body="Tem um projeto em mente ou alguma questão? Estamos disponíveis para responder rapidamente."
        />
        <div className={element("cards")}>
          <Stack
            gap="0.5rem"
            alignItems="flex-start"
            className={element("cards__card")}
          >
            <h2>💬 Fale connosco pelo WhatsApp</h2>
            <p>
              Garantimos uma resposta humana — sem bots. Estamos disponíveis em
              dias úteis, das 9h às 18h.
            </p>
            <Button
              type="link"
              label="Abrir WhatsApp"
              rightIcon={<IconUserInterfaceNavigationArrowRight />}
              href="https://wa.me/+351923314647"
              target="_blank"
              style={{ padding: 0 }}
              onClick={() =>
                sendGAEvent("event", "Rinu_CustomClick", {
                  Rinu_ScreenName: pathname,
                  Rinu_ItemCategory: "enquire_request_whatsapp",
                  Rinu_ItemType: null,
                })
              }
            />
          </Stack>
          <Stack gap="0.5rem" className={element("cards__card")}>
            <h2>✍️ Peça-nos um orçamento</h2>
            <p>
              Demora menos de 2 minutos e respondemos em 12 horas úteis com uma
              proposta personalizada.
            </p>
            <Button
              type="link"
              label="Pedir orçamento"
              rightIcon={<IconUserInterfaceNavigationArrowRight />}
              onClick={() => {
                onRequestQuote();
                sendGAEvent("event", "Rinu_CustomClick", {
                  Rinu_ScreenName: pathname,
                  Rinu_ItemCategory: "enquire_request_form",
                  Rinu_ItemType: null,
                });
              }}
              style={{ padding: 0 }}
            />
          </Stack>
        </div>
      </Stack>
    </main>
  );
};
