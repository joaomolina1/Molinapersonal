"use client";

import { useEffect, useState } from "react";
import IllustrationOnboardingStep2 from "@/_design_system/_illustrations/OnboardingStep2.svg";
import TextBlock from "@/_design_system/TextBlock";
import { createBEMClasses } from "@/_utils/classname";

import Name from "../_shared/Name";
import Description from "../_shared/Description";
import Photos from "../_shared/Photos";
import Kind from "./Kind";
import Area from "./Area";
import { useRouter, useSearchParams } from "next/navigation";
import { Space, useSpace, useUpdateSpace } from "@/_models/space";
import Categories from "./Categories";
import Wrapper from "../Wrapper";
import Privacy from "./Privacy";
import { isNotNil } from "@/_utils/filter";
import { useScrollIntoView } from "@/_utils/scrollIntoView";
import { SpaceCategory } from "@/_constants/space/categories";
import { SpaceKind } from "@/_constants/space/kinds";
import { SpacePrivacy } from "@/_constants/space/privacies";
import { Photo, usePhotos } from "@/_models/photo";
import { Venue, useVenue } from "@/_models/venue";
import { useRouterPush } from "@/_services/navigation";
import { useSession } from "@/_services/session";
import { ServiceType } from "@/_constants/space/serviceTypes";
import { SpaceEventType } from "@/_constants/space/eventTypes";
import { useCreatePack, usePacks } from "@/_models/pack";
import IllustrationOnboardingServicesStep2 from "@/_design_system/_illustrations/OnboardingServicesStep2.svg";
import ServiceTypeInput from "./ServiceType";
import EventTypes from "../_shared/EventTypes";

const { block, element } = createBEMClasses("onboarding__step");

const Step2Wrapper = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const spaceID = searchParams.get("spaceID") ?? undefined;

  const { data: space, isPending: isPendingSpace } = useSpace(spaceID);
  const { data: venue, isPending: isPendingVenue } = useVenue(space?.venueID);
  const { data: photos, isPending: isPendingPhotos } = usePhotos(
    space?.allPhotoIDs,
  );

  if (isPendingSpace || isPendingVenue || isPendingPhotos) {
    return null;
  }

  if (!spaceID || !space || !venue || !photos) {
    router.replace("/");
    return null;
  }

  return <Step2 space={space} venue={venue} photos={photos} />;
};

const Step2 = ({
  space,
  venue,
  photos,
}: {
  space: Space;
  venue: Venue;
  photos: Photo[];
}) => {
  const [session] = useSession();
  const isAdmin = session?.roles.includes("admin");

  const routerPush = useRouterPush();
  const step2State = useStep2State(space, photos);

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
      if (scrollTo === "name") {
        step2State.nameScrollIntoView();
      }

      if (scrollTo === "photos") {
        step2State.photosScrollIntoView();
      }

      setHasScrolled(true);
    }
  }, [scrollTo, hasScrolled, step2State]);

  const checkErrors = () => {
    step2State.setShowErrors(true);

    if (step2State.hasErrors) {
      if (step2State.nameError) {
        step2State.nameScrollIntoView();
        return true;
      }

      if (step2State.categoriesError) {
        step2State.categoriesScrollIntoView();
        return true;
      }

      if (step2State.kindError) {
        step2State.kindScrollIntoView();
        return true;
      }

      if (step2State.privacyError) {
        step2State.privacyScrollIntoView();
        return true;
      }

      if (step2State.serviceTypeError) {
        step2State.serviceTypeScrollIntoView();
        return true;
      }

      if (step2State.descriptionError) {
        step2State.descriptionScrollIntoView();
        return true;
      }

      if (step2State.areaError) {
        step2State.areaScrollIntoView();
        return true;
      }

      if (step2State.eventTypesError) {
        step2State.eventTypesScrollIntoView();
        return true;
      }

      if (step2State.photosError) {
        step2State.photosScrollIntoView();
        return true;
      }

      return false;
    }
  };

  const saveSpace = async () => {
    const newAttributes = [
      ...(space.isServicesJourney
        ? [step2State.serviceType, ...step2State.eventTypes]
        : [
            ...step2State.categories,
            step2State.kind,
            step2State.privacy,
            ...space.eventTypeAttributesIds,
          ]),
      ...space.facilitiesAttributesIds,
      ...space.accessibilitiesAttributesIds,
      ...space.cateringAttributesIds,
      ...space.soundAttributesIds,
    ].filter(isNotNil);

    await updateSpace({
      id: space.id,
      body: {
        name: step2State.name,
        description: step2State.description,
        attributes: newAttributes,
        primaryPhotoID: step2State.photos[0]?.id ?? "",
        photoIDs: step2State.photos.slice(1).map(({ id }) => id),
        area: step2State.area,
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
    if (space.isServicesJourney) {
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
    } else {
      routerPush(`/onboarding/space-details?spaceID=${space.id}`);
    }
  };

  return (
    <Wrapper
      step={2}
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
        space.isVenuesJourney || (space.isInProgress && !isAdmin)
          ? {
              label: "Continuar",
              onClick: async () => {
                setActionClicked("footer");
                if (!checkErrors()) {
                  await saveSpace();
                  goToNextStep();
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
      previousButton={
        venue.isInProgress && !isAdmin
          ? {
              label: "Anterior",
              href: `/onboarding/venue?venueID=${space.venueID}`,
            }
          : undefined
      }
      totalSteps={space.isServicesJourney ? 4 : 5}
    >
      <Step2Form
        step2State={step2State}
        space={space}
        hasPacks={!!packs?.length}
      />
    </Wrapper>
  );
};

const useStep2State = (initialSpace?: Space, initialPhotos?: Photo[]) => {
  const [name, setName] = useState(initialSpace?.name ?? "");
  const [categories, setCategories] = useState<SpaceCategory[]>(
    initialSpace?.categoryAttributesIds ?? [],
  );
  const [kind, setKind] = useState<SpaceKind | undefined>(
    initialSpace?.kindAttributeId,
  );
  const [privacy, setPrivacy] = useState<SpacePrivacy | undefined>(
    initialSpace?.privacyAttributeId,
  );
  const [serviceType, setServiceType] = useState<ServiceType | undefined>(
    initialSpace?.serviceTypeAttributeId,
  );
  const [description, setDescription] = useState(
    initialSpace?.description ?? "",
  );
  const [area, setArea] = useState(initialSpace?.area);
  const [eventTypes, setEventTypes] = useState<SpaceEventType[]>(
    initialSpace?.eventTypeAttributesIds ?? [],
  );
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos ?? []);

  const [showErrors, setShowErrors] = useState(false);

  const mandatoryError = "Campo de preenchimento obrigatório";

  const nameError = !name ? mandatoryError : undefined;
  const categoriesError = initialSpace?.isServicesJourney
    ? undefined
    : categories.length === 0
      ? mandatoryError
      : undefined;
  const kindError = initialSpace?.isServicesJourney
    ? undefined
    : !kind
      ? mandatoryError
      : undefined;
  const privacyError = initialSpace?.isServicesJourney
    ? undefined
    : !privacy
      ? mandatoryError
      : undefined;
  const serviceTypeError = initialSpace?.isServicesJourney
    ? !serviceType
      ? mandatoryError
      : undefined
    : undefined;
  const descriptionError = !description
    ? mandatoryError
    : description.length < 75
      ? "A descrição deve ter pelo menos 75 caracteres"
      : undefined;
  const areaError = initialSpace?.isServicesJourney
    ? undefined
    : !area
      ? mandatoryError
      : undefined;
  const eventTypesError = initialSpace?.isServicesJourney
    ? eventTypes.length === 0
      ? mandatoryError
      : undefined
    : undefined;
  const photosError =
    photos.length === 0
      ? mandatoryError
      : photos.length < 3
        ? "Adicione pelo menos 3 fotografias"
        : undefined;

  const [nameRef, nameScrollIntoView] = useScrollIntoView<HTMLDivElement>();
  const [categoriesRef, categoriesScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [kindRef, kindScrollIntoView] = useScrollIntoView<HTMLDivElement>();
  const [privacyRef, privacyScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [serviceTypeRef, serviceTypeScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [descriptionRef, descriptionScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [areaRef, areaScrollIntoView] = useScrollIntoView<HTMLDivElement>();
  const [eventTypesRef, eventTypesScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [photosRef, photosScrollIntoView] = useScrollIntoView<HTMLDivElement>();

  return {
    name,
    setName,
    nameError,
    nameRef,
    nameScrollIntoView,
    categories,
    setCategories,
    categoriesError,
    categoriesRef,
    categoriesScrollIntoView,
    kind,
    setKind,
    kindError,
    kindRef,
    kindScrollIntoView,
    privacy,
    setPrivacy,
    privacyError,
    privacyRef,
    privacyScrollIntoView,
    serviceType,
    setServiceType,
    serviceTypeError,
    serviceTypeRef,
    serviceTypeScrollIntoView,
    description,
    setDescription,
    descriptionError,
    descriptionRef,
    descriptionScrollIntoView,
    area,
    setArea,
    areaError,
    areaRef,
    areaScrollIntoView,
    eventTypes,
    setEventTypes,
    eventTypesError,
    eventTypesRef,
    eventTypesScrollIntoView,
    photos,
    setPhotos,
    photosError,
    photosRef,
    photosScrollIntoView,
    showErrors,
    setShowErrors,
    hasErrors:
      !!nameError ||
      !!categoriesError ||
      !!kindError ||
      !!privacyError ||
      !!serviceTypeError ||
      !!descriptionError ||
      !!areaError ||
      !!eventTypesError ||
      !!photosError,
  };
};

type Step2State = ReturnType<typeof useStep2State>;

export const Step2Form = ({
  step2State,
  space,
  hasPacks,
}: {
  step2State?: Step2State;
  space?: Space;
  hasPacks?: boolean;
}) => {
  return (
    <div className={block()}>
      <div className={element("intro")}>
        {space?.isServicesJourney ? (
          <IllustrationOnboardingServicesStep2 />
        ) : (
          <IllustrationOnboardingStep2 />
        )}
        {space?.isInProgress ? (
          <TextBlock
            microtitle="Passo 2"
            title={
              space.isServicesJourney
                ? "Apresente-nos o seu serviço"
                : "Vamos adicionar um espaço ao seu local"
            }
            body={
              space.isServicesJourney
                ? "Cada serviço que oferece é uma nova oportunidade para atrair clientes. Se o seu negócio proporciona diversas opções, como catering, decoração, ou entretenimento, cada um deve ser registado individualmente."
                : "Um espaço é uma área do seu local que estará disponível para alugar. O seu local pode ter mais do que um espaço. Assim sendo poderá adicionar quantos quiser."
            }
          />
        ) : (
          <TextBlock
            title={
              space?.isServicesJourney ? "Editar o serviço" : "Editar o espaço"
            }
          />
        )}
      </div>

      <div ref={step2State?.nameRef}>
        <Name
          name={step2State?.name}
          setName={step2State?.setName}
          label={
            space?.isServicesJourney
              ? "Qual o nome do seu serviço?"
              : "Qual o nome do espaço?"
          }
          ariaLabel={
            space?.isServicesJourney ? "Nome do serviço" : "Nome do espaço"
          }
          tip={
            space?.isServicesJourney
              ? undefined
              : `Este é o nome que vai aparecer aos clientes seguido do nome do local. Por exemplo se o seu local se chama "Hotel Maria" e se colocar aqui "Sala de reuniões", o nome que irá aparecer aos clientes na oferta será "Sala de Reuniões - Hotel Maria"`
          }
          error={step2State?.showErrors ? step2State.nameError : undefined}
        />
      </div>

      {space?.isVenuesJourney && (
        <div ref={step2State?.categoriesRef}>
          <Categories
            categories={step2State?.categories}
            setCategories={step2State?.setCategories}
            error={
              step2State?.showErrors ? step2State.categoriesError : undefined
            }
          />
        </div>
      )}

      {space?.isVenuesJourney && (
        <div ref={step2State?.kindRef}>
          <Kind
            kind={step2State?.kind}
            setKind={step2State?.setKind}
            error={step2State?.showErrors ? step2State.kindError : undefined}
          />
        </div>
      )}

      {space?.isVenuesJourney && (
        <div ref={step2State?.privacyRef}>
          <Privacy
            privacy={step2State?.privacy}
            setPrivacy={step2State?.setPrivacy}
            error={step2State?.showErrors ? step2State.privacyError : undefined}
          />
        </div>
      )}

      {space?.isServicesJourney && (
        <div ref={step2State?.serviceTypeRef}>
          <ServiceTypeInput
            serviceType={step2State?.serviceType}
            setServiceType={step2State?.setServiceType}
            error={
              step2State?.showErrors ? step2State.serviceTypeError : undefined
            }
            disabled={hasPacks}
          />
        </div>
      )}

      <div ref={step2State?.descriptionRef}>
        <Description
          description={step2State?.description}
          setDescription={step2State?.setDescription}
          subtitle={
            space?.isServicesJourney
              ? "Descreva o seu serviço"
              : "Crie a sua descrição."
          }
          tip={
            space?.isServicesJourney ? (
              <>
                Não detalhe aqui a sua oferta. Vai poder fazê-lo no passo
                seguinte na zona de packs.
                <br />
                Mencione aqui os principais atrativos do seu serviço,
                especialidades e áreas de atuação, e qualquer outro detalhe que
                destaque o seu serviço dos demais. Esta é a sua oportunidade de
                contar a história do que oferece e de captar o interesse do
                cliente.
                <br />
                Exemplo: &quot;O nosso serviço de catering que dá para vários
                tipos de eventos. Como casamentos, baptizados, eventos
                empresariais e outros eventos sociais - privados ou
                corporativos. A nossa equipa trabalha cada evento como uma
                ocasião única, adequando-se a cada ocasião e espaço. Temos
                capacidade para fazer o catering de A-Z ou apenas o que
                pretender para qualquer número de convidados&quot;
              </>
            ) : (
              "A descrição deve mencionar destaques do espaço, tipos de eventos organizados, instalações do espaço e localização."
            )
          }
          ariaLabel={
            space?.isServicesJourney
              ? "Descrição do serviço"
              : "Descrição do espaço"
          }
          minChars={75}
          maxChars={600}
          error={
            step2State?.showErrors ? step2State.descriptionError : undefined
          }
        />
      </div>

      {space?.isVenuesJourney && (
        <div ref={step2State?.areaRef}>
          <Area
            area={step2State?.area}
            setArea={step2State?.setArea}
            error={step2State?.showErrors ? step2State.areaError : undefined}
          />
        </div>
      )}

      {space?.isServicesJourney && (
        <EventTypes
          eventTypes={step2State?.eventTypes}
          setEventTypes={step2State?.setEventTypes}
          error={
            step2State?.showErrors ? step2State.eventTypesError : undefined
          }
          limit={20}
          subtitle="Para que tipo de eventos é que este serviço é adequado?"
        />
      )}

      <div ref={step2State?.photosRef}>
        <Photos
          photos={step2State?.photos}
          setPhotos={step2State?.setPhotos}
          max={20}
          minDimensions={{ width: 680, height: 480 }}
          subtitle={
            space?.isServicesJourney
              ? "Adicione algumas fotografias do seu serviço em ação"
              : "Adicione algumas fotografias deste espaço."
          }
          body="Escolha até 20 fotografias e no mínimo 3. Mais tarde poderá adicionar outras e fazer alterações."
          tip={
            space?.isServicesJourney
              ? "Opte por imagens que representem o seu serviço e a qualidade do trabalho. Mais tarde, poderá adicionar mais fotografias ou fazer alterações. Por exemplo, se oferece animação musical, inclua imagens das atuações ao vivo e não apenas fotos promocionais do grupo ou equipamento. Se o seu serviço é de Catering, coloque fotografias de eventos passados com pessoas a usufruirem do seu serviço."
              : "Por exemplo, se este espaço for uma sala de reuniões de um hotel só devem constar fotografias da sala de reuniões e não do hotel. Se for a sala única de um restaurante então coloque aqui fotografias do interior e no local (passo anterior) coloque as fotografias do exterior"
          }
          error={step2State?.showErrors ? step2State.photosError : undefined}
        />
      </div>
    </div>
  );
};

export default Step2Wrapper;
