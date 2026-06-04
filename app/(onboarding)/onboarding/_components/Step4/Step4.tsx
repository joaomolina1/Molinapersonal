"use client";

import { useState } from "react";
import TextBlock from "@/_design_system/TextBlock";
import { createBEMClasses } from "@/_utils/classname";

import IllustrationOnboardingStep4 from "@/_design_system/_illustrations/OnboardingStep4.svg";
import Name from "../_shared/Name";
import Description from "../_shared/Description";
import Features from "./Features";
import Prices, { getPricesError, PriceDraft } from "./Prices";
import { Pack, usePack, useUpdatePack } from "@/_models/pack";
import { useScrollIntoView } from "@/_utils/scrollIntoView";
import Attachments from "../_shared/Attachments";
import NoticeDays from "./NoticeDays";
import { useRouter, useSearchParams } from "next/navigation";
import Wrapper from "../Wrapper";
import Duration, { isValidDuration } from "./Duration";
import Cancellation from "./Cancellation";
import { PackFeature } from "@/_constants/pack/features";
import { Attachment, useAttachments } from "@/_models/attachment";
import { useDeletePhoto } from "@/_models/photo";
import { PackCapacity } from "@/_constants/pack/capacities";
import Capacity from "./Capacity";
import { Space, useSpace } from "@/_models/space";
import { useRouterPush } from "@/_services/navigation";
import { useSession } from "@/_services/session";
import PackHelpModal from "./PackHelpModal";
import IllustrationOnboardingServicesStep3 from "@/_design_system/_illustrations/OnboardingServicesStep3.svg";
import { PackServiceTypeFeature } from "@/_constants/space/serviceTypes";
import ServiceTypeFeatures from "./ServiceTypeFeatures";
import Extras, { ExtraDraft, getExtrasError } from "./Extras";
import ServiceCapacity from "./ServiceCapacity";
import TravelExpensesIntervals, {
  getTravelExpensesIntervalsError,
  TravelExpensesIntervalDraft,
} from "./TravelExpensesIntervals";
import { useDebouncedState } from "@/_utils/debounce";
import { VenueAddress, VenueLocation } from "@/_design_system/Map";
import TravelExpensesAddress from "./TravelExpensesAddress";
import Adjudication from "./Adjudication";
import UpfrontPercentage from "./UpfrontPercentage";

const { block, element } = createBEMClasses("onboarding__step");

const Step4Wrapper = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const packID = searchParams.get("packID") ?? undefined;
  const spaceIDFromQuery = searchParams.get("spaceID") ?? undefined;

  const { data: pack, isPending: isPendingPack } = usePack(packID);
  const spaceID = pack?.spaceIDs?.[0] ?? spaceIDFromQuery;
  const { data: space, isPending: isPendingSpace } = useSpace(spaceID);
  const attachmentIds =
    pack?.attachmentIDs && pack.attachmentIDs.length > 0
      ? pack.attachmentIDs
      : undefined;
  const { data: attachments, isPending: isPendingAttachments } =
    useAttachments(attachmentIds);

  const waitingAttachments =
    !!attachmentIds?.length && isPendingAttachments;

  if (isPendingPack || isPendingSpace || waitingAttachments) {
    return null;
  }

  if (!packID || !pack || !space) {
    router.replace("/");
    return null;
  }

  return <Step4 pack={pack} space={space} attachments={attachments ?? []} />;
};

const Step4 = ({
  pack,
  space,
  attachments,
}: {
  pack: Pack;
  space: Space;
  attachments: Attachment[];
}) => {
  const [session] = useSession();
  const isAdmin = session?.roles.includes("admin");

  const routerPush = useRouterPush();
  const step4State = useStep4State(pack, attachments);
  const { mutateAsync: deletePhoto } = useDeletePhoto();

  const {
    mutateAsync: updatePack,
    isPending: isPendingUpdatePack,
    isSuccess: isSuccessUpdatePack,
  } = useUpdatePack();

  const [actionClicked, setActionClicked] = useState<"header" | "footer">();

  const checkErrors = () => {
    step4State.setShowErrors(true);

    if (step4State.hasErrors) {
      if (step4State.nameError) {
        step4State.nameScrollIntoView();
        return true;
      }

      if (step4State.featuresError) {
        step4State.featuresScrollIntoView();
        return true;
      }

      if (step4State.serviceTypeFeaturesError) {
        step4State.serviceTypeFeaturesScrollIntoView();
        return true;
      }

      if (step4State.descriptionError) {
        step4State.descriptionScrollIntoView();
        return true;
      }

      if (step4State.attachmentsError) {
        step4State.attachmentsScrollIntoView();
        return true;
      }

      if (step4State.noticeDaysError) {
        step4State.noticeDaysScrollIntoView();
        return true;
      }

      if (step4State.durationError) {
        step4State.durationScrollIntoView();
        return true;
      }

      if (step4State.pricesError) {
        step4State.pricesScrollIntoView();
        return true;
      }

      if (step4State.extrasError) {
        step4State.extrasScrollIntoView();
        return true;
      }

      if (step4State.capacitiesError) {
        step4State.capacitiesScrollIntoView();
        return true;
      }

      if (step4State.travelExpensesIntervalsError) {
        step4State.travelExpensesIntervalsScrollIntoView();
        return true;
      }

      if (step4State.travelExpensesAddressError) {
        step4State.travelExpensesAddressScrollIntoView();
        return true;
      }

      if (step4State.cancellationError) {
        step4State.cancellationScrollIntoView();
        return true;
      }

      if (isAdmin && step4State.upfrontPercentageError) {
        step4State.upfrontPercentageScrollIntoView();
        return true;
      }

      return true;
    }

    return false;
  };

  const savePack = async () => {
    const previousPhotoIDs = pack.allPhotoIDs;

    await updatePack({
      id: pack.id,
      body: {
        name: step4State.name,
        description: step4State.description,
        attributes: [...step4State.features, ...step4State.serviceTypeFeatures],
        primaryPhotoID: "",
        photoIDs: [],
        attachmentIDs: step4State.attachments.map(({ id }) => id),
        noticeDays: step4State.noticeDays,
        minTime: step4State.minTime?.string ?? "",
        maxTime: step4State.maxTime?.string ?? "",
        prices: step4State.prices.map((price) => ({
          from: price.from,
          to: price.to,
          schedules: price.schedules.map((schedule) => ({
            start: schedule.start?.string,
            end: schedule.end?.string,
            minValue: schedule.minValue,
            valueHour: schedule.valueHour,
            valuePerson: schedule.valuePerson,
            daysOfWeek: schedule.daysOfWeek,
          })),
        })),
        extras: step4State.extras.map((extra) => ({
          id: extra.id,
          description: extra.description,
          tooltip: extra.tooltip ?? null,
          fixedPrice: extra.fixedPrice,
          pricePax: extra.pricePax,
          priceHour: extra.priceHour,
          mandatory: extra.mandatory,
          defaultHour: extra.defaultHour ?? null,
          minHour: extra.minHour ?? null,
          maxHour: extra.maxHour ?? null,
          defaultPax: extra.defaultPax ?? null,
          minPax: extra.minPax ?? null,
          maxPax: extra.maxPax ?? null,
        })),
        travelExpenses: step4State.travelExpensesIntervals.length
          ? {
              ...(step4State.travelExpensesFromBilling
                ? { from_billing: true }
                : {
                    from_billing: false,
                    country: step4State.travelExpensesAddress?.country,
                    street1: step4State.travelExpensesAddress?.street1,
                    street2: step4State.travelExpensesAddress?.street2,
                    postalCode: step4State.travelExpensesAddress?.postalCode,
                    city: step4State.travelExpensesAddress?.city,
                    latitude: step4State.travelExpensesLocation?.latitude,
                    longitude: step4State.travelExpensesLocation?.longitude,
                  }),
              intervals: step4State.travelExpensesIntervals.map((interval) => ({
                from: interval.from,
                to: interval.to,
                price: interval.price,
              })),
            }
          : undefined,
        cancellationPeriod: step4State.cancellation,
        capacities: step4State.capacities,
        ...(isAdmin ? { upfrontPercentage: step4State.upfrontPercentage } : {}),
      },
    });

    if (previousPhotoIDs.length) {
      await Promise.allSettled(
        previousPhotoIDs.map((photoID) => deletePhoto(photoID)),
      );
    }
  };

  const exit = () => {
    if (isAdmin) {
      routerPush("/admin");
    } else {
      routerPush("/host");
    }
  };

  const goToNextStep = () => {
    const spaceId = pack.primarySpaceID ?? space.id;
    routerPush(`/onboarding/packs?spaceID=${spaceId}`);
  };

  return (
    <Wrapper
      step={pack.isServicesJourney ? 3 : 4}
      saveAndExitButton={
        pack.isInProgress && !isAdmin
          ? {
              label: "Gravar e sair",
              onClick: async () => {
                setActionClicked("header");
                await savePack();
                exit();
              },
              loading:
                actionClicked === "header" &&
                (isPendingUpdatePack || isSuccessUpdatePack),
            }
          : {
              label: "Cancelar",
              onClick: () => {
                setActionClicked("header");
                exit();
              },
            }
      }
      nextButton={
        pack.isInProgress && !isAdmin
          ? {
              label: "Continuar",
              onClick: async () => {
                setActionClicked("footer");
                if (!checkErrors()) {
                  await savePack();
                  goToNextStep();
                }
              },
              loading:
                actionClicked === "footer" &&
                (isPendingUpdatePack || isSuccessUpdatePack),
            }
          : {
              label: "Gravar",
              onClick: async () => {
                setActionClicked("footer");
                if (!checkErrors()) {
                  await savePack();
                  exit();
                }
              },
              loading:
                actionClicked === "footer" &&
                (isPendingUpdatePack || isSuccessUpdatePack),
            }
      }
      previousButton={
        space.isInProgress && !isAdmin
          ? {
              label: "Anterior",
              href: pack.isServicesJourney
                ? `/onboarding/space?spaceID=${pack.primarySpaceID ?? space.id}`
                : `/onboarding/space-details?spaceID=${pack.primarySpaceID ?? space.id}`,
            }
          : undefined
      }
      totalSteps={pack.isServicesJourney ? 4 : 5}
    >
      <Step4Form step4State={step4State} pack={pack} space={space} isAdmin={isAdmin} />
    </Wrapper>
  );
};

const useStep4State = (initialPack?: Pack, initialAttachments?: Attachment[]) => {
  const [name, setName] = useState(initialPack?.name ?? "");
  const [hasFeatures, setHasFeatures] = useState<boolean>(
    !!initialPack?.featureAttributes?.length,
  );
  const [features, setFeatures] = useState<PackFeature[]>(
    initialPack?.featureAttributesIds ?? [],
  );
  const [serviceTypeFeatures, setServiceTypeFeatures] = useState<
    PackServiceTypeFeature[]
  >(initialPack?.serviceTypeFeatureAttributesIds ?? []);
  const [description, setDescription] = useState(
    initialPack?.description ?? "",
  );
  const [attachments, setAttachments] = useState<Attachment[]>(
    initialAttachments ?? [],
  );
  const [noticeDays, setNoticeDays] = useState(initialPack?.noticeDays);
  const [hasDuration, setHasDuration] = useState<boolean>(
    !!initialPack?.minTime?.number || !!initialPack?.maxTime?.number,
  );
  const [minTime, setMinTime] = useState(initialPack?.minTime);
  const [maxTime, setMaxTime] = useState(initialPack?.maxTime);
  const [prices, setPrices] = useState<PriceDraft[]>(initialPack?.prices ?? []);
  const [extras, setExtras] = useState<ExtraDraft[]>(initialPack?.extras ?? []);
  const [travelExpensesIntervals, setTravelExpensesIntervals] = useState<
    TravelExpensesIntervalDraft[]
  >(initialPack?.travelExpenses?.intervals ?? []);
  const [travelExpensesFromBilling, setTravelExpensesFromBilling] = useState(
    initialPack?.travelExpenses?.from_billing,
  );
  const [
    travelExpensesAddress,
    debouncedTravelExpensesAddress,
    setTravelExpensesAddress,
  ] = useDebouncedState<VenueAddress | null>(
    initialPack?.travelExpenses &&
      !initialPack.travelExpenses.from_billing &&
      initialPack.travelExpenses.latitude !== 0 &&
      initialPack.travelExpenses.longitude !== 0
      ? {
          country: initialPack.travelExpenses.country,
          street1: initialPack.travelExpenses.street1,
          street2: initialPack.travelExpenses.street2,
          postalCode: initialPack.travelExpenses.postalCode,
          city: initialPack.travelExpenses.city,
        }
      : null,
    500,
  );
  const [travelExpensesLocation, setTravelExpensesLocation] =
    useState<VenueLocation | null>(
      initialPack?.travelExpenses &&
        !initialPack.travelExpenses.from_billing &&
        initialPack.travelExpenses.latitude !== 0 &&
        initialPack.travelExpenses.longitude !== 0
        ? {
            latitude: initialPack.travelExpenses.latitude,
            longitude: initialPack.travelExpenses.longitude,
          }
        : null,
    );
  const [cancellation, setCancellation] = useState(
    initialPack?.cancellationPeriod,
  );
  const [upfrontPercentage, setUpfrontPercentage] = useState<number | undefined>(
    initialPack?.upfrontPercentage ?? 20,
  );
  const [capacities, setCapacities] = useState<PackCapacity[]>(
    initialPack?.capacities ?? [],
  );

  const [showErrors, setShowErrors] = useState(false);

  const mandatoryError = "Campo de preenchimento obrigatório";

  const nameError = !name ? mandatoryError : undefined;
  const featuresError = initialPack?.isServicesJourney
    ? undefined
    : hasFeatures === undefined
      ? mandatoryError
      : hasFeatures && features.length === 0
        ? "Por favor indique o que o pack inclui além do aluguer do espaço"
        : undefined;
  const serviceTypeFeaturesError = initialPack?.isServicesJourney
    ? serviceTypeFeatures.length === 0
      ? mandatoryError
      : undefined
    : undefined;
  const descriptionError = !description
    ? mandatoryError
    : description.length < 100
      ? "A descrição deve ter pelo menos 100 caracteres"
      : undefined;
  const attachmentsError =
    attachments.length > 10 ? "Pode incluir no máximo 10 ficheiros" : undefined;
  const noticeDaysError = noticeDays === undefined ? mandatoryError : undefined;
  const durationError =
    hasDuration === undefined
      ? mandatoryError
      : !hasDuration || (hasDuration && isValidDuration(minTime, maxTime))
        ? undefined
        : "Por favor indique uma duração mínima e máxima válidas";
  const pricesError = getPricesError(prices);
  const extrasError = getExtrasError(extras);
  const travelExpensesIntervalsError = initialPack?.isServicesJourney
    ? getTravelExpensesIntervalsError(travelExpensesIntervals)
    : undefined;
  const travelExpensesAddressError = initialPack?.isServicesJourney
    ? travelExpensesFromBilling === undefined
      ? mandatoryError
      : travelExpensesFromBilling
        ? undefined
        : !travelExpensesLocation || !travelExpensesAddress
          ? mandatoryError
          : !travelExpensesAddress.street1 ||
              !travelExpensesAddress.postalCode ||
              !travelExpensesAddress.city
            ? "Por favor indique a morada, o código postal e a cidade"
            : undefined
    : undefined;
  const cancellationError = !cancellation ? mandatoryError : undefined;
  const upfrontPercentageError =
    upfrontPercentage === undefined
      ? mandatoryError
      : upfrontPercentage < 0 || upfrontPercentage > 100
        ? "Indique um valor entre 0 e 100"
        : undefined;
  const capacitiesError = initialPack?.isServicesJourney
    ? undefined
    : capacities.length === 0 ||
        capacities.every(({ capacity }) => capacity === 0)
      ? "Campo de preenchimento obrigatório"
      : undefined;

  const [nameRef, nameScrollIntoView] = useScrollIntoView<HTMLDivElement>();
  const [featuresRef, featuresScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [serviceTypeFeaturesRef, serviceTypeFeaturesScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [descriptionRef, descriptionScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [attachmentsRef, attachmentsScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [noticeDaysRef, noticeDaysScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [durationRef, durationScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [pricesRef, pricesScrollIntoView] = useScrollIntoView<HTMLDivElement>();
  const [extrasRef, extrasScrollIntoView] = useScrollIntoView<HTMLDivElement>();
  const [travelExpensesIntervalsRef, travelExpensesIntervalsScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [travelExpensesAddressRef, travelExpensesAddressScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [cancellationRef, cancellationScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [upfrontPercentageRef, upfrontPercentageScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [capacitiesRef, capacitiesScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();

  return {
    name,
    setName,
    nameError,
    nameRef,
    nameScrollIntoView,
    hasFeatures,
    setHasFeatures,
    features,
    setFeatures,
    featuresError,
    featuresRef,
    featuresScrollIntoView,
    serviceTypeFeatures,
    setServiceTypeFeatures,
    serviceTypeFeaturesError,
    serviceTypeFeaturesRef,
    serviceTypeFeaturesScrollIntoView,
    description,
    setDescription,
    descriptionError,
    descriptionRef,
    descriptionScrollIntoView,
    attachments,
    setAttachments,
    attachmentsError,
    attachmentsRef,
    attachmentsScrollIntoView,
    noticeDays,
    setNoticeDays,
    noticeDaysError,
    noticeDaysRef,
    noticeDaysScrollIntoView,
    hasDuration,
    setHasDuration,
    minTime,
    setMinTime,
    maxTime,
    setMaxTime,
    durationError,
    durationRef,
    durationScrollIntoView,
    prices,
    setPrices,
    pricesError,
    pricesRef,
    pricesScrollIntoView,
    extras,
    setExtras,
    extrasError,
    extrasRef,
    extrasScrollIntoView,
    travelExpensesIntervals,
    setTravelExpensesIntervals,
    travelExpensesIntervalsError,
    travelExpensesIntervalsRef,
    travelExpensesIntervalsScrollIntoView,
    travelExpensesFromBilling,
    setTravelExpensesFromBilling,
    travelExpensesAddress,
    debouncedTravelExpensesAddress,
    setTravelExpensesAddress,
    travelExpensesLocation,
    setTravelExpensesLocation,
    travelExpensesAddressError,
    travelExpensesAddressRef,
    travelExpensesAddressScrollIntoView,
    cancellation,
    setCancellation,
    cancellationError,
    cancellationRef,
    cancellationScrollIntoView,
    upfrontPercentage,
    setUpfrontPercentage,
    upfrontPercentageError,
    upfrontPercentageRef,
    upfrontPercentageScrollIntoView,
    capacities,
    setCapacities,
    capacitiesError,
    capacitiesRef,
    capacitiesScrollIntoView,
    showErrors,
    setShowErrors,
    hasErrors:
      !!nameError ||
      !!featuresError ||
      !!serviceTypeFeaturesError ||
      !!descriptionError ||
      !!attachmentsError ||
      !!noticeDaysError ||
      !!durationError ||
      !!pricesError ||
      !!extrasError ||
      !!travelExpensesIntervalsError ||
      !!travelExpensesAddressError ||
      !!cancellationError ||
      !!upfrontPercentageError ||
      !!capacitiesError,
  };
};

type Step4State = ReturnType<typeof useStep4State>;

export const Step4Form = ({
  step4State,
  pack,
  space,
  isAdmin,
}: {
  step4State?: Step4State;
  pack?: Pack;
  space?: Space;
  isAdmin?: boolean;
}) => {
  return (
    <div className={block()}>
      <div className={element("intro")}>
        {pack?.isServicesJourney ? (
          <IllustrationOnboardingServicesStep3 />
        ) : (
          <IllustrationOnboardingStep4 />
        )}
        {pack?.isInProgress ? (
          <TextBlock
            microtitle={pack.isServicesJourney ? "Passo 3" : "Passo 4"}
            title="Packs"
            body={
              pack.isServicesJourney
                ? "Descreva agora o pack que os clientes podem reservar. O pack pode ser apenas o serviço principal ou então pode incluir mais serviços complementares por exemplo. Vai poder adicionar vários packs diferentes ao seu serviço"
                : "Descreva agora o pack que os clientes podem reservar. O pack pode ser apenas o aluguer do espaço ou então pode incluir mais serviços como refeições por exemplo. Vai poder adicionar vários packs diferentes ao seu espaço."
            }
          />
        ) : (
          <TextBlock title="Editar o pack" />
        )}
      </div>

      <div ref={step4State?.nameRef}>
        <Name
          name={step4State?.name}
          setName={step4State?.setName}
          label="Qual o nome do pack?"
          tip={
            pack?.isServicesJourney
              ? `Escolha um nome apelativo e evidente para o seu pack, de forma a torná-lo mais atrativo. Por exemplo, se oferece catering para eventos, pode usar nomes como "Cocktail Dinatoire" ou "Refeição Servida", conforme o que está a vender nesse pacote em específico. Quando combinar vários serviços, opte por nomes mais descritivos, como "Cocktail Dinatoire + DJ" ou "DJ + Saxofonista".`
              : `Dê um nome atrativo ao seu pack, de forma a incentivar a sua escolha. Por exemplo, se apenas estiver a alugar o espaço sugerimos o nome "Aluguer do espaço". Se o pack for o espaço com almoço então o nome pode ser "Espaço com almoço". Se for um restaurante onde o pack inclui jantar e as bebidas então o nome pode ficar "Espaço com jantar e bebidas incluídas".`
          }
          ariaLabel="Nome do pack"
          error={step4State?.showErrors ? step4State.nameError : undefined}
          maxChars={45}
        >
          {pack?.isServicesJourney ? null : <PackHelpModal />}
        </Name>
      </div>

      {pack?.isVenuesJourney && (
        <div ref={step4State?.featuresRef}>
          <Features
            hasFeatures={step4State?.hasFeatures}
            setHasFeatures={step4State?.setHasFeatures}
            features={step4State?.features}
            setFeatures={step4State?.setFeatures}
            error={
              step4State?.showErrors ? step4State.featuresError : undefined
            }
          />
        </div>
      )}

      {pack?.isServicesJourney && (
        <>
          <div ref={step4State?.serviceTypeFeaturesRef} />
          <ServiceTypeFeatures
            space={space}
            features={step4State?.serviceTypeFeatures}
            setFeatures={step4State?.setServiceTypeFeatures}
            error={
              step4State?.showErrors
                ? step4State.serviceTypeFeaturesError
                : undefined
            }
          />
        </>
      )}

      <div ref={step4State?.descriptionRef}>
        <Description
          description={step4State?.description}
          setDescription={step4State?.setDescription}
          subtitle="Descreva o seu pack."
          tip={
            pack?.isServicesJourney ? (
              <>
                Torne a sua oferta atrativa! Descreva detalhadamente a oferta
                que irá oferecer e cative os clientes.
                <br />
                <br />
                Ex: Este pack inclui um Coffee Break composto por: Biscoitos,
                Pastelaria diversa, Sumo de Laranja e de Maça, Água e Café.
                <br />
                <br />
                Apenas os primeiros 400 caracteres aparecem na zona de packs,
                mas a restante informação pode ser consultada caso o cliente
                clique em ver detalhes.
              </>
            ) : (
              <>
                Torne o seu espaço mais atrativo descrevendo detalhadamente a
                oferta que irá oferecer e cative os clientes com uma experiência
                memorável.
                <br />
                <br />
                Apenas os primeiros 400 caracteres aparecem na zona de packs,
                mas a restante informação pode ser consultada caso o cliente
                clique em ver detalhes.
              </>
            )
          }
          ariaLabel="Descrição do pack"
          maxChars={800}
          minChars={100}
          error={
            step4State?.showErrors ? step4State.descriptionError : undefined
          }
        />
      </div>

      <div ref={step4State?.attachmentsRef}>
        <Attachments
          attachments={step4State?.attachments}
          setAttachments={step4State?.setAttachments}
          max={10}
          subtitle="Adicione anexos a este pack."
          body="Pode incluir até 10 ficheiros (por ex. menus, propostas ou apresentações). Este campo é opcional."
          tip={
            pack?.isServicesJourney
              ? "Use anexos para partilhar documentos que ajudem o cliente a perceber o que está incluído no pack — por exemplo, propostas de catering, listas de equipamentos ou condições específicas do serviço."
              : "Use anexos para partilhar documentos úteis ao cliente — por exemplo, menus, plantas do espaço ou condições específicas deste pack."
          }
          error={
            step4State?.showErrors ? step4State.attachmentsError : undefined
          }
        />
      </div>

      <div ref={step4State?.noticeDaysRef}>
        <NoticeDays
          noticeDays={step4State?.noticeDays}
          setNoticeDays={step4State?.setNoticeDays}
          error={
            step4State?.showErrors ? step4State.noticeDaysError : undefined
          }
        />
      </div>

      <div ref={step4State?.durationRef}>
        <Duration
          hasDuration={step4State?.hasDuration}
          setHasDuration={step4State?.setHasDuration}
          minTime={step4State?.minTime}
          setMinTime={step4State?.setMinTime}
          maxTime={step4State?.maxTime}
          setMaxTime={step4State?.setMaxTime}
          error={step4State?.showErrors ? step4State.durationError : undefined}
        />
      </div>

      <div ref={step4State?.pricesRef}>
        <Prices
          prices={step4State?.prices}
          setPrices={step4State?.setPrices}
          error={step4State?.showErrors ? step4State.pricesError : undefined}
          mode="edit"
        />
      </div>

      <div ref={step4State?.extrasRef}>
        <Extras
          extras={step4State?.extras}
          setExtras={step4State?.setExtras}
          error={step4State?.showErrors ? step4State.extrasError : undefined}
        />
      </div>

      {pack?.isVenuesJourney && (
        <div ref={step4State?.capacitiesRef}>
          <Capacity
            capacities={step4State?.capacities}
            setCapacities={step4State?.setCapacities}
            error={
              step4State?.showErrors ? step4State.capacitiesError : undefined
            }
          />
        </div>
      )}

      {pack?.isServicesJourney && (
        <div ref={step4State?.capacitiesRef}>
          <ServiceCapacity
            capacities={step4State?.capacities}
            setCapacities={step4State?.setCapacities}
          />
        </div>
      )}

      {pack?.isServicesJourney && (
        <div ref={step4State?.travelExpensesIntervalsRef}>
          <TravelExpensesIntervals
            intervals={step4State?.travelExpensesIntervals}
            setIntervals={step4State?.setTravelExpensesIntervals}
            error={
              step4State?.showErrors
                ? step4State.travelExpensesIntervalsError
                : undefined
            }
          />
        </div>
      )}

      {pack?.isServicesJourney && (
        <div ref={step4State?.travelExpensesAddressRef}>
          <TravelExpensesAddress
            fromBilling={step4State?.travelExpensesFromBilling}
            setFromBilling={step4State?.setTravelExpensesFromBilling}
            location={step4State?.travelExpensesLocation}
            address={step4State?.travelExpensesAddress}
            debouncedAddress={step4State?.debouncedTravelExpensesAddress}
            onChangeLocation={step4State?.setTravelExpensesLocation}
            onChangeAddress={step4State?.setTravelExpensesAddress}
            showErrors={step4State?.showErrors}
            error={
              step4State?.showErrors
                ? step4State?.travelExpensesAddressError
                : undefined
            }
          />
        </div>
      )}

      {isAdmin ? (
        <div ref={step4State?.upfrontPercentageRef}>
          <UpfrontPercentage
            upfrontPercentage={step4State?.upfrontPercentage}
            setUpfrontPercentage={step4State?.setUpfrontPercentage}
            error={
              step4State?.showErrors
                ? step4State.upfrontPercentageError
                : undefined
            }
          />
        </div>
      ) : (
        <Adjudication />
      )}

      <div ref={step4State?.cancellationRef}>
        <Cancellation
          cancellation={step4State?.cancellation}
          setCancellation={step4State?.setCancellation}
          error={
            step4State?.showErrors ? step4State.cancellationError : undefined
          }
        />
      </div>
    </div>
  );
};

export default Step4Wrapper;
