import { createBEMClasses } from "@/_utils/classname";
import InputText from "@/_design_system/InputText";
import InputPhone from "@/_design_system/InputPhone";
import InputSelect from "@/_design_system/InputSelect";
import Button from "@/_design_system/Button";
import ToggleButton from "@/_design_system/ToggleButton";
import { useCities } from "@/_models/search";
import InputDate from "@/_design_system/InputDate";
import { today, getLocalTimeZone } from "@internationalized/date";
import InputTimeRange from "@/_design_system/InputTimeRange";
import InputNumber from "@/_design_system/InputNumber";
import InputTextArea from "@/_design_system/InputTextArea";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { useRef, useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { allEventTypeOptions } from "@/(main)/search/_utils/attributes";
import EventTypeSelect from "@/(main)/_components/EventTypeSelect";
import {
  CONTACT_METHODS,
  QuoteRequestModalFormState,
} from "./QuoteRequestForm";
import { SelectInstance } from "react-select";
import { EventTypeOption } from "../../EventTypeSelect/EventTypeSelect";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { usePhoto } from "@/_models/photo";
import Image from "next/image";
import TextBlock from "@/_design_system/TextBlock";
import Card from "@/_design_system/Card";
import { useCreateContact } from "@/_models/contact";
import { useSession } from "@/_services/session";
import HiddenVenueName from "@/_components/HiddenVenueName";
import { useHideVenueName } from "@/_components/HiddenVenueName/HiddenVenueName";

const { block, element } = createBEMClasses("quote-request-form-step1");

export const QuoteRequestFormStep1 = ({
  state,
  type,
}: {
  state: QuoteRequestModalFormState;
  type: "quote-request" | "contact-request";
}) => {
  const isMobile = useMediaQuery("large");
  const pathname = usePathname();
  const [session] = useSession();
  const step1State = useQuoteRequestFormStep1State();

  const {
    setStep,
    name,
    email,
    phone,
    companyEvent,
    companyName,
    eventType,
    city,
    date,
    startEnd,
    budget,
    numPeople,
    comment,
    setComment,
    contactMethod,
    setContactMethod,
    pack,
    space,
    venue,
    hasMissingFields,
    hasInvalidBudget,
    hasInvalidEmail,
    hasInvalidPhone,
  } = state;

  const {
    showErrors,
    setShowErrors,
    eventTypeRef,
    cityRef,
    dateRef,
    startEndRef,
    budgetLabelRef,
    budgetRef,
    numPeopleLabelRef,
    numPeopleRef,
    commentRef,
    nameRef,
    emailRef,
    companyNameRef,
  } = step1State;

  const {
    mutateAsync: createContact,
    isPending: isPendingCreateContact,
    isError: isErrorCreateContact,
  } = useCreateContact();

  const onContinue = async () => {
    setShowErrors(true);

    if (
      hasMissingFields ||
      hasInvalidBudget ||
      hasInvalidEmail ||
      hasInvalidPhone
    ) {
      if (type === "quote-request" || contactMethod === "quote-request") {
        if (!eventType) {
          if (isMobile) {
            // On Mobile, the .focus() method is not working properly
            // So we just scroll to the top in order to display the element.
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            eventTypeRef.current?.focus();
          }
          return;
        }

        if (!city) {
          cityRef.current?.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => cityRef.current?.click(), 500);
          return;
        }

        if (!date) {
          dateRef.current?.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => dateRef.current?.click(), 500);
          return;
        }

        if (!startEnd.start || !startEnd.end) {
          startEndRef.current?.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => startEndRef.current?.click(), 500);
          return;
        }

        if (!budget || hasInvalidBudget) {
          budgetLabelRef.current?.scrollIntoView({ behavior: "smooth" });
          budgetRef.current?.focus();
          return;
        }

        if (!numPeople) {
          numPeopleLabelRef.current?.scrollIntoView({ behavior: "smooth" });
          numPeopleRef.current?.focus();
          return;
        }
      }

      if (
        type === "quote-request" ||
        contactMethod === "message" ||
        contactMethod === "quote-request"
      ) {
        if (!comment) {
          commentRef.current?.focus();
          return;
        }
      }

      if (!name) {
        nameRef.current?.focus();
        return;
      }

      if (!email.email || hasInvalidEmail) {
        emailRef.current?.focus();
        return;
      }

      if (
        ((type === "quote-request" ||
          contactMethod === "quote-request" ||
          contactMethod === "call") &&
          (!phone.extension || !phone.number)) ||
        hasInvalidPhone
      ) {
        // With the `react-phone-number-input` component, I couldn't find a way
        // to pass a ref to the input, in order to focus on it.
        (
          document.querySelector(
            ".quote-request-form-step1 .input-phone input",
          ) as HTMLInputElement | undefined
        )?.focus();
        return;
      }

      if (type === "quote-request" || contactMethod === "quote-request") {
        if (companyEvent && !companyName) {
          companyNameRef.current?.focus();
          return;
        }
      }

      return;
    }

    if (type === "quote-request" || contactMethod === "quote-request") {
      if (type === "quote-request") {
        sendGAEvent("event", "Rinu_CustomClick", {
          Rinu_ScreenName: pathname,
          Rinu_ItemCategory: "enquire_request_continue",
          Rinu_ItemType: null,
        });
      } else {
        sendGAEvent("event", "Rinu_CustomClick", {
          Rinu_ScreenName: pathname,
          Rinu_ItemCategory: "Contact_enquire_request",
          Rinu_ItemType: state.pack ? "pack_type" : "info_type",
          Rinu_eLabel1: state.pack?.name,
          Rinu_eLabel2: state.space?.name,
          Rinu_eLabel3: state.venue?.name,
          Rinu_eLabel4: state.pack?.id,
          Rinu_eLabel5: state.space?.id,
          Rinu_eLabel6: state.venue?.id,
        });
      }

      setStep("form-2");
    } else {
      sendGAEvent("event", "Rinu_CustomClick", {
        Rinu_ScreenName: pathname,
        Rinu_ItemCategory:
          state.contactMethod === "call"
            ? "contact_request_phoneme"
            : "contact_request_message",
        Rinu_ItemType: state.pack ? "pack_type" : "info_type",
        Rinu_eLabel1: state.pack?.name,
        Rinu_eLabel2: state.space?.name,
        Rinu_eLabel3: state.venue?.name,
        Rinu_eLabel4: state.pack?.id,
        Rinu_eLabel5: state.space?.id,
        Rinu_eLabel6: state.venue?.id,
      });

      await createContact({
        user_id: session?.user_id,
        name: state.name,
        email: state.email.email,
        phone_extension: state.phone.extension,
        phone_number: state.phone.number,
        kind: state.contactMethod ?? "",
        message: state.comment,
        venue_id: state.venue?.id,
        space_id: state.space?.id,
        pack_id: state.pack?.id,
      });

      setStep("form-success");
    }
  };

  const { data: spacePhoto } = usePhoto(space?.primaryPhotoID);

  const hideVenueName = useHideVenueName(venue?.subscription);

  return (
    <>
      <main className={block()}>
        {!!space && !!venue && (
          <>
            <TextBlock
              {...(type === "quote-request"
                ? {
                    subtitle: "👉 Procura uma solução à medida?",
                    body: "Os nossos packs são apenas um ponto de partida. Conte-nos o que precisa e criamos uma proposta adaptada ao seu evento.",
                  }
                : {
                    subtitle: (
                      <>
                        ✉️ Contactar{" "}
                        <HiddenVenueName
                          name={venue.name}
                          subscription={venue.subscription}
                          fallback="o local"
                        />
                      </>
                    ),
                  })}
              style={{ gap: "0.5rem" }}
            />
            <div className={element("section")}>
              <p className={element("section__title")}>
                {pack ? "Pack preferencial" : "Espaço preferencial"}
              </p>
              <div className={element("space-card")}>
                {!!spacePhoto?.small && (
                  <div className={element("space-card__photo")}>
                    <Image alt="" src={spacePhoto.small} fill />
                  </div>
                )}
                <div>
                  {pack ? (
                    <>
                      <p className={element("space-card__title")}>
                        {pack.name}
                      </p>
                      <p className={element("space-card__info")}>
                        {space.name}
                      </p>
                      <p className={element("space-card__info")}>
                        <HiddenVenueName
                          name={`${venue.name} · `}
                          subscription={venue.subscription}
                        />
                        {venue.city}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className={element("space-card__title")}>
                        {space.name}
                      </p>
                      {!hideVenueName && (
                        <p className={element("space-card__info")}>
                          {venue.name}
                        </p>
                      )}
                      <p className={element("space-card__info")}>
                        {venue.city}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        {type === "quote-request" && (
          <>
            <EventInfo state={state} type={type} step1State={step1State} />
            <ContactInfo state={state} type={type} step1State={step1State} />
          </>
        )}
        {type === "contact-request" && (
          <>
            <ContactInfo state={state} type={type} step1State={step1State} />
            <div className={element("section")}>
              <p className={element("section__title")}>
                Como pretende o contacto?
              </p>
              <div className={element("section__inputs")}>
                {CONTACT_METHODS.map((contactMethodOption) => (
                  <Card
                    key={contactMethodOption.id}
                    type="radio"
                    radioGroupName="contact-method"
                    text={contactMethodOption.label}
                    checked={contactMethod === contactMethodOption.id}
                    onChange={() => setContactMethod(contactMethodOption.id)}
                  />
                ))}
              </div>
            </div>
            {contactMethod === "message" && (
              <div className={element("section")}>
                <p className={element("section__title")}>
                  Qual a sua mensagem?
                </p>
                <div className={element("section__inputs")}>
                  <InputTextArea
                    label="Diga-nos um pouco mais sobre o evento"
                    showLabel
                    value={comment}
                    onChange={setComment}
                    height="small"
                    invalid={showErrors && !comment}
                    className={element("comment")}
                    ref={commentRef}
                  />
                </div>
              </div>
            )}
            {contactMethod === "quote-request" && (
              <EventInfo state={state} type={type} step1State={step1State} />
            )}
          </>
        )}
      </main>
      <footer className={element("footer")}>
        {showErrors && hasMissingFields && (
          <InputError error="Por favor preencha todos os campos obrigatórios" />
        )}
        {isErrorCreateContact && (
          <InputError error="Ocorreu um erro ao submeter o pedido de contacto" />
        )}
        <Button
          type="primary"
          label={
            type === "quote-request" || contactMethod === "quote-request"
              ? "Continuar"
              : "Enviar"
          }
          onClick={onContinue}
          loading={isPendingCreateContact}
        />
      </footer>
    </>
  );
};

const useQuoteRequestFormStep1State = () => {
  const [showErrors, setShowErrors] = useState(false);
  const eventTypeRef = useRef<SelectInstance<EventTypeOption>>(null);
  const cityRef = useRef<HTMLButtonElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const startEndRef = useRef<HTMLButtonElement>(null);
  const budgetLabelRef = useRef<HTMLLabelElement>(null);
  const budgetRef = useRef<HTMLInputElement>(null);
  const numPeopleLabelRef = useRef<HTMLLabelElement>(null);
  const numPeopleRef = useRef<HTMLInputElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const companyNameRef = useRef<HTMLInputElement>(null);

  return {
    showErrors,
    setShowErrors,
    eventTypeRef,
    cityRef,
    dateRef,
    startEndRef,
    budgetLabelRef,
    budgetRef,
    numPeopleLabelRef,
    numPeopleRef,
    commentRef,
    nameRef,
    emailRef,
    companyNameRef,
  };
};

type QuoteRequestFormStep1State = ReturnType<
  typeof useQuoteRequestFormStep1State
>;

const EventInfo = ({
  state,
  step1State,
}: {
  state: QuoteRequestModalFormState;
  type: "quote-request" | "contact-request";
  step1State: QuoteRequestFormStep1State;
}) => {
  const {
    eventType,
    setEventType,
    city,
    setCity,
    date,
    setDate,
    startEnd,
    setStartEnd,
    budget,
    setBudget,
    numPeople,
    setNumPeople,
    comment,
    setComment,
    hasInvalidBudget,
  } = state;

  const {
    showErrors,
    eventTypeRef,
    cityRef,
    dateRef,
    startEndRef,
    budgetLabelRef,
    budgetRef,
    numPeopleRef,
    numPeopleLabelRef,
    commentRef,
  } = step1State;

  const { data: cities = [] } = useCities({ enabled: true });

  return (
    <div className={element("section")}>
      <p className={element("section__title")}>Informações do evento</p>
      <div className={element("section__inputs")}>
        <EventTypeSelect
          eventTypeOptions={allEventTypeOptions}
          eventType={eventType}
          setEventType={setEventType}
          label="Tipo de evento"
          invalid={showErrors && !eventType}
          ref={eventTypeRef}
        />
        <InputSelect
          label="Zona do país"
          value={city}
          onChange={setCity}
          options={[
            {
              id: "Lisboa-1",
              text: "Lisboa",
            },
            {
              id: "Porto-1",
              text: "Porto",
            },
            ...cities.map((city) => ({
              id: city.Name,
              text: city.Name,
            })),
          ]}
          invalid={showErrors && !city}
          ref={cityRef}
        />
        <InputDate
          label="Data do evento"
          value={date}
          onChange={setDate}
          min={today(getLocalTimeZone()).add({ days: 1 })}
          invalid={showErrors && !date}
          ref={dateRef}
        />
        <InputTimeRange
          label="Horário"
          start={startEnd.start}
          end={startEnd.end}
          onChange={(start, end) => setStartEnd({ start, end })}
          invalid={showErrors && (!startEnd.start || !startEnd.end)}
          ref={startEndRef}
        />
        <InputNumber
          label="Budget total"
          value={budget ?? undefined}
          onChange={(value) => setBudget(value ?? null)}
          allowNegative={false}
          decimalScale={0}
          suffix=" €"
          invalid={showErrors && !budget}
          error={
            showErrors && hasInvalidBudget
              ? "O valor a colocar no budget deve ser o valor total e não o valor por pessoa ou por hora"
              : undefined
          }
          ref={budgetRef}
          labelRef={budgetLabelRef}
        />
        <InputNumber
          label="Nº de pessoas"
          value={numPeople ?? undefined}
          onChange={(value) => setNumPeople(value ?? null)}
          suffix={numPeople === 1 ? " pessoa" : " pessoas"}
          allowNegative={false}
          decimalScale={0}
          invalid={showErrors && !numPeople}
          ref={numPeopleRef}
          labelRef={numPeopleLabelRef}
        />
        <InputTextArea
          label="Diga-nos um pouco mais sobre o evento"
          showLabel
          value={comment}
          onChange={setComment}
          info="Ex: Quero organizar a minha festa de 40 anos com cocktail, jantar e dancing incluídos. Um saxofonista durante o cocktail seria fantástico!"
          height="small"
          invalid={showErrors && !comment}
          className={element("comment")}
          ref={commentRef}
        />
      </div>
    </div>
  );
};

const ContactInfo = ({
  state,
  type,
  step1State,
}: {
  state: QuoteRequestModalFormState;
  type: "quote-request" | "contact-request";
  step1State: QuoteRequestFormStep1State;
}) => {
  const {
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    companyEvent,
    setCompanyEvent,
    companyName,
    setCompanyName,
    vat,
    setVat,
    contactMethod,
    hasInvalidEmail,
    isPhoneRequired,
    hasMissingPhone,
    hasInvalidPhone,
  } = state;

  const { showErrors, nameRef, emailRef, companyNameRef } = step1State;

  return (
    <div className={element("section")}>
      <p className={element("section__title")}>Responsável pelo evento</p>
      <div className={element("section__inputs")}>
        <InputText
          label="Nome"
          value={name}
          onChange={setName}
          invalid={showErrors && !name}
          ref={nameRef}
        />
        <InputText
          label="Email"
          type="email"
          value={email.email}
          onChange={(value) =>
            setEmail({
              email: value,
              isValid: !!emailRef.current?.checkValidity(),
            })
          }
          invalid={showErrors && !email.email}
          ref={emailRef}
          error={
            showErrors && hasInvalidEmail ? "Insira um email válido" : undefined
          }
        />
        <InputPhone
          optional={!isPhoneRequired}
          extension={phone.extension}
          number={phone.number}
          onChange={(extension, number) => setPhone({ extension, number })}
          invalid={showErrors && hasMissingPhone}
          error={
            showErrors && hasInvalidPhone
              ? "Insira um telemóvel válido"
              : undefined
          }
        />
        {(type === "quote-request" || contactMethod === "quote-request") && (
          <>
            <div className={element("toggle")}>
              <span>Evento empresarial</span>
              <ToggleButton
                size="medium"
                selected={companyEvent}
                onChange={(selected) => {
                  setCompanyEvent(selected);
                  setCompanyName("");
                }}
              />
            </div>
            <InputText
              label="Empresa"
              value={companyName}
              onChange={setCompanyName}
              disabled={!companyEvent}
              invalid={showErrors && companyEvent && !companyName}
              ref={companyNameRef}
            />
            <InputText
              label="NIF/NIPC"
              value={vat}
              onChange={setVat}
              format="### ### ###"
              infoTooltip={{
                content:
                  "Coloque aqui o NIF que deve ser colocado na fatura em caso de confirmação de evento",
                visibleOnTouchDevice: true,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};
