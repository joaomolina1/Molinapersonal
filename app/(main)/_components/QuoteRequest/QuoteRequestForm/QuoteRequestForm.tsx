import { createBEMClasses } from "@/_utils/classname";
import { QuoteRequestFormWelcome } from "./QuoteRequestFormWelcome";
import { QuoteRequestFormStep1 } from "./QuoteRequestFormStep1";
import { QuoteRequestFormStep2 } from "./QuoteRequestFormStep2";
import { QuoteRequestFormSuccess } from "./QuoteRequestFormSuccess";
import ProgressBar from "@/_design_system/ProgressBar";
import Stack from "@/_design_system/Stack";
import { useSession } from "@/_services/session";
import { useEffect, useState } from "react";
import { CalendarDate } from "@internationalized/date";
import { TimeDuration } from "@/_utils/number";
import { PackFeature } from "@/_constants/pack/features";
import { SpaceEventType } from "@/_constants/space/eventTypes";
import { IconButton } from "@/_design_system/Button";
import IconUserInterfaceActionsClose from "@/_design_system/_icons/UserInterface/Actions/Close.svg";
import Avatar from "@/_design_system/Avatar";
import { useSearchParams } from "next/navigation";
import { useQuoteRequestContext } from "../QuoteRequestProvider";
import { useSpace } from "@/_models/space";
import { useVenue } from "@/_models/venue";
import { usePacks } from "@/_models/pack";
import { isValidPhone } from "@/_design_system/InputPhone";

const { block, element } = createBEMClasses("quote-request-form");

const QuoteRequestForm = ({
  type,
  onClose,
}: {
  type: "quote-request" | "contact-request";
  onClose?: () => void;
}) => {
  const state = useQuoteRequestModalFormState({ type });
  const { step, setStep } = state;

  useEffect(() => {
    if (!onClose) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className={block()}>
      {(step === "form-1" || step === "form-2" || onClose) && (
        <header>
          <div className={element("header-top")}>
            {(step === "form-1" || step === "form-2") && (
              <Stack row gap="0.5rem" alignItems="center">
                {type === "quote-request" && (
                  <div className={element("avatars")}>
                    {["matilde", "afonso", "luisa"].map((image) => (
                      <div className={element("avatars__item")} key={image}>
                        <Avatar
                          url={`/quote-request-banner/${image}.webp`}
                          imagePosition="top"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {type === "quote-request" ? (
                  <h1>Peça-nos um orçamento</h1>
                ) : (
                  <h1>Enviar mensagem</h1>
                )}
              </Stack>
            )}
            {onClose && (
              <IconButton
                icon={<IconUserInterfaceActionsClose />}
                ariaLabel="Fechar"
                onClick={onClose}
              />
            )}
          </div>
          {(step === "form-1" || step === "form-2") && (
            <FormProgressBar step={step} />
          )}
        </header>
      )}
      {step === "welcome" && (
        <QuoteRequestFormWelcome onRequestQuote={() => setStep("form-1")} />
      )}
      {step === "form-1" && <QuoteRequestFormStep1 state={state} type={type} />}
      {step === "form-2" && <QuoteRequestFormStep2 state={state} />}
      {step === "form-success" && <QuoteRequestFormSuccess type={type} />}
    </div>
  );
};

const FormProgressBar = ({ step }: { step: "form-1" | "form-2" }) => {
  return (
    <Stack row gap="0.25rem" style={{ marginTop: "1rem" }}>
      {Array(2)
        .fill(0)
        .map((_, index) => (
          <ProgressBar
            key={index}
            progress={
              step === "form-2"
                ? index === 1
                  ? 55
                  : 100
                : index === 1
                  ? 0
                  : 55
            }
          />
        ))}
    </Stack>
  );
};

const useQuoteRequestModalFormState = ({
  type,
}: {
  type: "quote-request" | "contact-request";
}) => {
  const [session] = useSession();
  const searchParams = useSearchParams();
  const {
    quoteRequestModalData: { context },
  } = useQuoteRequestContext();

  const venueID =
    (searchParams.get("venueID") ?? context?.venueID) || undefined;
  const spaceID =
    (searchParams.get("spaceID") ?? context?.spaceID) || undefined;
  const packID = (searchParams.get("packID") ?? context?.packID) || undefined;

  const { data: venue } = useVenue(venueID, "public");
  const { data: space } = useSpace(spaceID, "public");
  const { data: packs } = usePacks(
    { spaceID, mode: "public" },
    { enabled: !!packID },
  );
  const pack = packs?.find(({ id }) => id === packID);

  // Note: We have temporarily deactivated the whatsapp option
  // because people were just using it instead of completing the form.
  // Therefore we the "welcome" step is not used.
  const [step, setStep] = useState<
    "welcome" | "form-1" | "form-2" | "form-success"
  >("form-1");

  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState({
    email: session?.email ?? "",
    isValid: session?.email ? true : false,
  });
  const [phone, setPhone] = useState<{ extension?: number; number?: number }>({
    extension: undefined,
    number: undefined,
  });
  const [companyEvent, setCompanyEvent] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [vat, setVat] = useState("");
  const [eventType, setEventType] = useState<SpaceEventType | null>(null);
  const [city, setCity] = useState("");
  const [date, setDate] = useState<CalendarDate | null>(null);
  const [startEnd, setStartEnd] = useState<{
    start: TimeDuration | null;
    end: TimeDuration | null;
  }>({
    start: null,
    end: null,
  });
  const [budget, setBudget] = useState<number | null>(null);
  const [numPeople, setNumPeople] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [packFeatures, setPackFeatures] = useState<PackFeature[]>([]);
  const [contactMethod, setContactMethod] = useState<ContactMethod | null>(
    "quote-request",
  );

  const hasMissingName = !name;
  const hasMissingEmail = !email.email;
  const isPhoneRequired =
    type === "quote-request" ||
    contactMethod === "quote-request" ||
    contactMethod === "call";
  const hasMissingPhone =
    isPhoneRequired && (!phone.extension || !phone.number);
  const isContactMethodRequired = type === "contact-request";
  const hasMissingContactMethod = isContactMethodRequired && !contactMethod;
  const isCommentRequired =
    type === "quote-request" ||
    contactMethod === "quote-request" ||
    contactMethod === "message";
  const hasMissingComment = isCommentRequired && !comment;
  const hasMissingOtherQuoteRequestFields =
    (type === "quote-request" || contactMethod === "quote-request") &&
    (!eventType ||
      !city ||
      !date ||
      !startEnd.start ||
      !startEnd.end ||
      !budget ||
      !numPeople ||
      (companyEvent && !companyName));

  const hasMissingFields =
    hasMissingName ||
    hasMissingEmail ||
    hasMissingPhone ||
    hasMissingContactMethod ||
    hasMissingComment ||
    hasMissingOtherQuoteRequestFields;

  const hasInvalidBudget =
    (type === "quote-request" || contactMethod === "quote-request") &&
    !!budget &&
    budget < 150;
  const hasInvalidEmail = !!email.email && !email.isValid;
  const hasInvalidPhone =
    !!phone.extension &&
    !!phone.number &&
    !isValidPhone({ ...phone, fullCheck: true });

  return {
    step,
    setStep,
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
    packFeatures,
    setPackFeatures,
    contactMethod,
    setContactMethod,
    space,
    venue,
    pack,
    hasMissingFields,
    hasInvalidBudget,
    hasInvalidEmail,
    isPhoneRequired,
    hasMissingPhone,
    hasInvalidPhone,
  };
};

export type QuoteRequestModalFormState = ReturnType<
  typeof useQuoteRequestModalFormState
>;

export default QuoteRequestForm;

export const CONTACT_METHODS = [
  {
    id: "quote-request",
    label: "Quero um orçamento personalizado",
  },
  {
    id: "call",
    label: "Quero que me liguem",
  },
  {
    id: "message",
    label: "Quero enviar uma mensagem",
  },
] as const;

export type ContactMethod = (typeof CONTACT_METHODS)[number]["id"];
