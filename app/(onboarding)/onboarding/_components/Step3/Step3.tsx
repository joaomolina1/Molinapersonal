"use client";

import { useEffect, useState } from "react";
import TextBlock from "@/_design_system/TextBlock";
import { createBEMClasses } from "@/_utils/classname";

import IllustrationOnboardingStep3 from "@/_design_system/_illustrations/OnboardingStep3.svg";
import { useRouter, useSearchParams } from "next/navigation";
import { Space, useSpace, useUpdateSpace } from "@/_models/space";
import { useScrollIntoView } from "@/_utils/scrollIntoView";
import EventTypes from "../_shared/EventTypes";
import Accessibilities from "./Accessibilities";
import Facilities from "./Facilities";
import Catering from "./Catering";
import Sound from "./Sound";
import { isNotNil } from "@/_utils/filter";
import Wrapper from "../Wrapper";
import { SpaceEventType } from "@/_constants/space/eventTypes";
import { SpaceFacility } from "@/_constants/space/facilities";
import { SpaceAccessibility } from "@/_constants/space/accessibilities";
import { SpaceCatering } from "@/_constants/space/catering";
import { SpaceSound } from "@/_constants/space/sound";
import { useCreatePack, usePacks } from "@/_models/pack";
import { useRouterPush } from "@/_services/navigation";
import { useSession } from "@/_services/session";

const { block, element } = createBEMClasses("onboarding__step");

const Step3Wrapper = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const spaceID = searchParams.get("spaceID") ?? undefined;

  const { data: space, isLoading: isLoadingSpace } = useSpace(spaceID);

  if (isLoadingSpace) {
    return null;
  }

  if (!spaceID || !space) {
    router.replace("/");
    return null;
  }

  return <Step3 space={space} />;
};

const Step3 = ({ space }: { space: Space }) => {
  const [session] = useSession();
  const isAdmin = session?.roles.includes("admin");

  const routerPush = useRouterPush();
  const step3State = useStep3State(space);

  const {
    mutateAsync: updateSpace,
    isPending: isPendingUpdateSpace,
    isSuccess: isSuccessUpdateSpace,
  } = useUpdateSpace();

  const {
    mutateAsync: createPack,
    isPending: isPendingCreatePack,
    isSuccess: isSuccessCreatePack,
  } = useCreatePack();

  const { data: packs } = usePacks({ spaceID: space.id });

  const serachParams = useSearchParams();
  const scrollTo = serachParams.get("scrollTo") ?? undefined;
  const [hasScrolled, setHasScrolled] = useState(false);

  const [actionClicked, setActionClicked] = useState<"header" | "footer">();

  useEffect(() => {
    if (scrollTo && !hasScrolled) {
      if (scrollTo === "eventTypes") {
        step3State.eventTypesScrollIntoView();
      }

      if (scrollTo === "facilities") {
        step3State.facilitiesScrollIntoView();
      }

      if (scrollTo === "accessibilities") {
        step3State.accessibilitiesScrollIntoView();
      }

      if (scrollTo === "catering") {
        step3State.cateringScrollIntoView();
      }

      if (scrollTo === "sound") {
        step3State.soundScrollIntoView();
      }

      setHasScrolled(true);
    }
  }, [scrollTo, hasScrolled, step3State]);

  const checkErrors = () => {
    step3State.setShowErrors(true);

    if (step3State.eventTypesError) {
      step3State.eventTypesScrollIntoView();
      return true;
    }

    return false;
  };

  const saveSpace = async () => {
    const newAttributes = [
      ...space.categoryAttributesIds,
      space.kindAttributeId,
      space.privacyAttributeId,
      space.serviceTypeAttributeId,
      ...step3State.eventTypes,
      ...step3State.facilities,
      ...step3State.accessibilities,
      ...step3State.catering,
      ...step3State.sound,
    ].filter(isNotNil);

    await updateSpace({
      id: space.id,
      body: {
        attributes: newAttributes,
      },
    });
  };

  const exit = () => {
    if (isAdmin) {
      routerPush("/admin");
    } else {
      routerPush("/host");
    }
  };

  const goToNextStep = async () => {
    if (packs?.length) {
      if (packs.length === 1 && !packs[0].isCompleted) {
        routerPush(`/onboarding/pack?packID=${packs[0].id}`);
      } else {
        routerPush(`/onboarding/packs?spaceID=${space.id}`);
      }
    } else {
      const pack = await createPack({ spaceID: space.id });
      routerPush(`/onboarding/pack?packID=${pack.id}`);
    }
  };

  return (
    <Wrapper
      step={3}
      saveAndExitButton={
        space.isInProgress && !isAdmin
          ? {
              label: "Gravar e sair",
              onClick: async () => {
                setActionClicked("header");
                await saveSpace();
                exit();
              },
              loading:
                actionClicked === "header" &&
                (isPendingUpdateSpace || isSuccessUpdateSpace),
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
        space.isInProgress && !isAdmin
          ? {
              label: "Continuar",
              onClick: async () => {
                setActionClicked("footer");
                if (!checkErrors()) {
                  await saveSpace();
                  await goToNextStep();
                }
              },
              loading:
                actionClicked === "footer" &&
                (isPendingUpdateSpace ||
                  isPendingCreatePack ||
                  isSuccessCreatePack),
            }
          : {
              label: "Gravar",
              onClick: async () => {
                setActionClicked("footer");
                if (!checkErrors()) {
                  await saveSpace();
                  exit();
                }
              },
              loading:
                actionClicked === "footer" &&
                (isPendingUpdateSpace || isSuccessUpdateSpace),
            }
      }
      previousButton={{
        label: "Anterior",
        href: `/onboarding/space?spaceID=${space.id}`,
      }}
    >
      <Step3Form step3State={step3State} space={space} />
    </Wrapper>
  );
};

const useStep3State = (initialSpace?: Space) => {
  const [eventTypes, setEventTypes] = useState<SpaceEventType[]>(
    initialSpace?.eventTypeAttributesIds ?? [],
  );
  const [facilities, setFacilities] = useState<SpaceFacility[]>(
    initialSpace?.facilitiesAttributesIds ?? [],
  );
  const [accessibilities, setAccessibilities] = useState<SpaceAccessibility[]>(
    initialSpace?.accessibilitiesAttributesIds ?? [],
  );
  const [catering, setCatering] = useState<SpaceCatering[]>(
    initialSpace?.cateringAttributesIds ?? [],
  );
  const [sound, setSound] = useState<SpaceSound[]>(
    initialSpace?.soundAttributesIds ?? [],
  );

  const [showErrors, setShowErrors] = useState(false);

  const mandatoryError = "Campo de preenchimento obrigatório";

  const eventTypesError = eventTypes.length === 0 ? mandatoryError : undefined;

  const [eventTypesRef, eventTypesScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [facilitiesRef, facilitiesScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [accessibilitiesRef, accessibilitiesScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [cateringRef, cateringScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [soundRef, soundScrollIntoView] = useScrollIntoView<HTMLDivElement>();

  return {
    eventTypes,
    setEventTypes,
    eventTypesError,
    eventTypesRef,
    eventTypesScrollIntoView,
    facilities,
    setFacilities,
    facilitiesRef,
    facilitiesScrollIntoView,
    accessibilities,
    setAccessibilities,
    accessibilitiesRef,
    accessibilitiesScrollIntoView,
    catering,
    setCatering,
    cateringRef,
    cateringScrollIntoView,
    sound,
    setSound,
    soundRef,
    soundScrollIntoView,
    showErrors,
    setShowErrors,
    hasErrors: !!eventTypesError,
  };
};

type Step3State = ReturnType<typeof useStep3State>;

export const Step3Form = ({
  step3State,
  space,
}: {
  step3State?: Step3State;
  space?: Space;
}) => {
  return (
    <div className={block()}>
      <div className={element("intro")}>
        <IllustrationOnboardingStep3 />
        {space?.isInProgress ? (
          <TextBlock
            microtitle="Passo 3"
            title="Já só falta selecionar mais algumas informações"
            body="Diga-nos as permissões e as características do seu espaço."
          />
        ) : (
          <TextBlock title="Editar o espaço" />
        )}
      </div>

      <div ref={step3State?.eventTypesRef}>
        <EventTypes
          eventTypes={step3State?.eventTypes}
          setEventTypes={step3State?.setEventTypes}
          error={
            step3State?.showErrors ? step3State.eventTypesError : undefined
          }
          limit={15}
          subtitle="Para que tipo de eventos é que este espaço é adequado?"
        />
      </div>

      <div ref={step3State?.facilitiesRef}>
        <Facilities
          facilities={step3State?.facilities}
          setFacilities={step3State?.setFacilities}
        />
      </div>

      <div ref={step3State?.accessibilitiesRef}>
        <Accessibilities
          accessibilities={step3State?.accessibilities}
          setAccessibilities={step3State?.setAccessibilities}
        />
      </div>

      <div ref={step3State?.cateringRef}>
        <Catering
          catering={step3State?.catering}
          setCatering={step3State?.setCatering}
        />
      </div>

      <Sound sound={step3State?.sound} setSound={step3State?.setSound} />
    </div>
  );
};

export default Step3Wrapper;
