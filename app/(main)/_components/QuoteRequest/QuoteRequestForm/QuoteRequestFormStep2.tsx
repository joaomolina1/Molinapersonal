import { createBEMClasses } from "@/_utils/classname";
import { PACK_FEATURES } from "@/_constants/pack/features";
import { Fragment } from "react";
import Stack from "@/_design_system/Stack";
import Chip from "@/_design_system/Chip";
import Tag from "@/_design_system/Tag";
import Button from "@/_design_system/Button";
import { usePathname } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { useCreateQuote } from "@/_models/quote";
import { useSession } from "@/_services/session";
import { getLocalTimeZone } from "@internationalized/date";
import { QuoteRequestModalFormState } from "./QuoteRequestForm";
import { InputError } from "@/_design_system/_utils/InputWrapper";

const { block, element } = createBEMClasses("quote-request-form-step2");

export const QuoteRequestFormStep2 = ({
  state,
}: {
  state: QuoteRequestModalFormState;
}) => {
  const [session] = useSession();
  const pathname = usePathname();
  const { packFeatures, setPackFeatures, setStep } = state;

  const {
    mutateAsync: createQuote,
    isPending: isPendingCreateQuote,
    isError: isErrorCreateQuote,
  } = useCreateQuote();

  const submit = async () => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "enquire_request_send",
      Rinu_ItemType: null,
    });

    await createQuote({
      user_id: session?.user_id,
      name: state.name,
      email: state.email.email,
      phone_extension: state.phone.extension,
      phone_number: state.phone.number,
      company_event: state.companyEvent,
      company_name: state.companyName,
      vat_number: state.vat.replace(/\s/g, ""),
      event_kind: state.eventType ?? undefined,
      area: state.city.replace("-1", ""),
      country: "Portugal",
      event_date: state.date?.toString(),
      start_at: state.startEnd.start?.string,
      end_at: state.startEnd.end?.string,
      timezone: getLocalTimeZone(),
      budget: state.budget ?? undefined,
      currency: "EUR",
      num_people: state.numPeople ?? undefined,
      notes: state.comment,
      attributes: state.packFeatures,
      venue_id: state.venue?.id,
      space_id: state.space?.id,
      pack_id: state.pack?.id,
    });

    setStep("form-success");
  };

  return (
    <>
      <main className={block()}>
        <div className={element("title")}>
          <span>Quer adicionar algum serviço?</span>
          <Tag text="Opcional" size="small" border={false} type="neutral-2" />
        </div>
        <p className={element("subtitle")}>
          O detalhe ajuda-nos a encontrar exatamente o que procura
        </p>
        <Stack gap="16px" alignItems="flex-start">
          {PACK_FEATURES.map((group, index) => (
            <Fragment key={index}>
              <p className={element("group-label")}>{group.label}</p>
              <Stack row gap="1rem" flexWrap="wrap">
                {[...group.chips]
                  .sort((a, b) => a.label.localeCompare(b.label))
                  .map((chip) => (
                    <Chip
                      key={chip.id}
                      leftIcon={chip.icon}
                      label={chip.label}
                      checked={packFeatures.includes(chip.id)}
                      onChange={() => {
                        if (packFeatures.includes(chip.id)) {
                          setPackFeatures(
                            packFeatures?.filter((item) => item !== chip.id),
                          );
                        } else {
                          setPackFeatures?.([...packFeatures, chip.id]);
                        }
                      }}
                    />
                  ))}
              </Stack>
            </Fragment>
          ))}
        </Stack>
      </main>
      <footer className={element("footer")}>
        {isErrorCreateQuote && (
          <InputError error="Ocorreu um erro ao submeter o pedido de orçamento" />
        )}
        <div className={element("footer__buttons")}>
          <Button
            type="secondary"
            label="Voltar"
            onClick={() => setStep("form-1")}
          />
          <Button
            type="primary"
            label={packFeatures.length > 0 ? "Enviar" : "Enviar sem serviços"}
            onClick={submit}
            loading={isPendingCreateQuote}
          />
        </div>
      </footer>
    </>
  );
};
