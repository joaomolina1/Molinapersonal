"use client";

import { useEffect, useState } from "react";
import {
  InputAddress,
  VenueAddress,
  VenueLocation,
} from "@/_design_system/Map";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import IllustrationOnboardingStep1 from "@/_design_system/_illustrations/OnboardingStep1.svg";
import { createBEMClasses } from "@/_utils/classname";
import { useDebouncedState } from "@/_utils/debounce";

import Name from "../_shared/Name";
import Description from "../_shared/Description";
import Photos from "../_shared/Photos";
import Extras from "./Extras";
import Billing, { VenueBilling } from "./Billing";
import Contact, { VenueContact } from "./Contact";
import Wrapper from "../Wrapper";
import { useRouter, useSearchParams } from "next/navigation";
import { Venue, useUpdateVenue, useVenue } from "@/_models/venue";
import { useCreateSpace, useSpaces } from "@/_models/space";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { useScrollIntoView } from "@/_utils/scrollIntoView";
import { VenueSleeping } from "@/_constants/venue/sleeping";
import { VenueParking } from "@/_constants/venue/parking";
import { isValidPhone } from "@/_design_system/InputPhone";
import { Photo, usePhotos } from "@/_models/photo";
import { useRouterPush } from "@/_services/navigation";
import { useSession } from "@/_services/session";
import IllustrationOnboardingServicesStep1 from "@/_design_system/_illustrations/OnboardingServicesStep1.svg";

const { block, element } = createBEMClasses("onboarding__step");

const Step1Wrapper = () => {
  const serachParams = useSearchParams();
  const router = useRouter();

  const venueID = serachParams.get("venueID") ?? undefined;

  const { data: venue, isPending: isPendingVenue } = useVenue(venueID);
  const { data: photos, isPending: isPendingPhotos } = usePhotos(
    venue?.allPhotoIDs,
  );

  if (isPendingVenue || isPendingPhotos) {
    return null;
  }

  if (!venueID || !venue || !photos) {
    router.replace("/");
    return null;
  }

  return <Step1 venue={venue} photos={photos} />;
};

const Step1 = ({ venue, photos }: { venue: Venue; photos: Photo[] }) => {
  const [session] = useSession();
  const isAdmin = session?.roles.includes("admin");

  const routerPush = useRouterPush();
  const step1State = useStep1State(venue, photos);

  const {
    mutateAsync: updateVenue,
    isPending: isPendingUpdateVenue,
    isSuccess: isSuccessUpdateVenue,
  } = useUpdateVenue();

  const {
    mutateAsync: createSpace,
    isPending: isPendingCreateSpace,
    isSuccess: isSuccessCreateSpace,
  } = useCreateSpace();

  const { data: spaces } = useSpaces({ venueID: venue.id });

  const serachParams = useSearchParams();
  const scrollTo = serachParams.get("scrollTo") ?? undefined;
  const [hasScrolled, setHasScrolled] = useState(false);

  const [actionClicked, setActionClicked] = useState<"header" | "footer">();

  useEffect(() => {
    if (scrollTo && !hasScrolled) {
      if (scrollTo === "description") {
        step1State.descriptionScrollIntoView();
      }

      if (scrollTo === "address") {
        step1State.addressScrollIntoView();
      }

      if (scrollTo === "sleepingParking") {
        step1State.sleepingParkingScrollIntoView();
      }

      if (scrollTo === "photos") {
        step1State.photosScrollIntoView();
      }

      if (scrollTo === "billing") {
        step1State.billingScrollIntoView();
      }

      if (scrollTo === "contact") {
        step1State.contactScrollIntoView();
      }

      setHasScrolled(true);
    }
  }, [scrollTo, hasScrolled, step1State]);

  const checkErrors = () => {
    step1State.setShowErrors(true);

    if (step1State.hasErrors) {
      if (step1State.nameError) {
        step1State.nameScrollIntoView();
        return true;
      }

      if (step1State.descriptionError) {
        step1State.descriptionScrollIntoView();
        return true;
      }

      if (step1State.addressError) {
        step1State.addressScrollIntoView();
        return true;
      }

      if (step1State.photosError) {
        step1State.photosScrollIntoView();
        return true;
      }

      if (step1State.billingError) {
        step1State.billingScrollIntoView();
        return true;
      }

      if (step1State.contactError) {
        step1State.contactScrollIntoView();
        return true;
      }

      return true;
    }

    return false;
  };

  const saveVenue = async () => {
    await updateVenue({
      id: venue.id,
      body: {
        name: step1State.name,
        description: step1State.description,
        attributes: [...step1State.sleeping, ...step1State.parking],
        primaryPhotoID: step1State.photos[0]?.id ?? "",
        photoIDs: step1State.photos.slice(1).map(({ id }) => id),
        country: step1State.address?.country,
        street1: step1State.address?.street1,
        street2: step1State.address?.street2,
        postalCode: step1State.address?.postalCode,
        city: step1State.address?.city,
        latitude: step1State.location?.latitude,
        longitude: step1State.location?.longitude,
        billingName: step1State.billing.name,
        billingVAT: step1State.billing.vat,
        billingAddress: step1State.billing.address,
        billingPostalCode: step1State.billing.postalCode,
        billingCity: step1State.billing.city,
        billingIBAN: step1State.billing.iban,
        billingEmail: step1State.billing.email,
        contactName: step1State.contact.name,
        contactPhoneExtension: step1State.contact.phoneExtension,
        contactPhoneNumber: step1State.contact.phoneNumber,
        contactEmail: step1State.contact.email,
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
    if (spaces?.length) {
      routerPush(`/onboarding/space?spaceID=${spaces[0].id}`);
    } else {
      const space = await createSpace({ venueID: venue.id });
      routerPush(`/onboarding/space?spaceID=${space.id}`);
    }
  };

  return (
    <Wrapper
      step={1}
      saveAndExitButton={
        venue.isInProgress && !isAdmin
          ? {
              label: "Gravar e sair",
              onClick: async () => {
                setActionClicked("header");
                await saveVenue();
                exit();
              },
              loading:
                actionClicked === "header" &&
                (isPendingUpdateVenue || isSuccessUpdateVenue),
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
        venue.isInProgress && !isAdmin
          ? {
              label: "Continuar",
              onClick: async () => {
                setActionClicked("footer");
                if (!checkErrors()) {
                  await saveVenue();
                  await goToNextStep();
                }
              },
              loading:
                actionClicked === "footer" &&
                (isPendingUpdateVenue ||
                  isPendingCreateSpace ||
                  isSuccessCreateSpace),
            }
          : {
              label: "Gravar",
              onClick: async () => {
                setActionClicked("footer");
                if (!checkErrors()) {
                  await saveVenue();
                  exit();
                }
              },
              loading:
                actionClicked === "footer" &&
                (isPendingUpdateVenue || isSuccessUpdateVenue),
            }
      }
      totalSteps={venue?.isServicesJourney ? 4 : 5}
    >
      <Step1Form step1State={step1State} venue={venue} />
    </Wrapper>
  );
};

const useStep1State = (initialVenue?: Venue, initialPhotos?: Photo[]) => {
  const [name, setName] = useState(initialVenue?.name ?? "");
  const [description, setDescription] = useState(
    initialVenue?.description ?? "",
  );
  const [address, debouncedAddress, setAddress] =
    useDebouncedState<VenueAddress | null>(
      initialVenue &&
        initialVenue.latitude !== 0 &&
        initialVenue.longitude !== 0
        ? {
            country: initialVenue.country,
            street1: initialVenue.street1,
            street2: initialVenue.street2,
            postalCode: initialVenue.postalCode,
            city: initialVenue.city,
          }
        : null,
      500,
    );
  const [location, setLocation] = useState<VenueLocation | null>(
    initialVenue && initialVenue.latitude !== 0 && initialVenue.longitude !== 0
      ? {
          latitude: initialVenue.latitude,
          longitude: initialVenue.longitude,
        }
      : null,
  );
  const [sleeping, setSleeping] = useState<VenueSleeping[]>(
    initialVenue?.sleepingAttributesIds ?? [],
  );
  const [parking, setParking] = useState<VenueParking[]>(
    initialVenue?.parkingAttributesIds ?? [],
  );
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos ?? []);
  const [billing, setBilling] = useState<VenueBilling>({
    name: initialVenue?.billingName ?? "",
    vat: initialVenue?.billingVAT ?? "",
    address: initialVenue?.billingAddress ?? "",
    postalCode: initialVenue?.billingPostalCode ?? "",
    city: initialVenue?.billingCity ?? "",
    iban: initialVenue?.billingIBAN ?? "",
    email: initialVenue?.billingEmail ?? "",
  });
  const [contact, setContact] = useState<VenueContact>({
    name: initialVenue?.contactName ?? "",
    phoneExtension: initialVenue?.contactPhoneExtension,
    phoneNumber: initialVenue?.contactPhoneNumber,
    email: initialVenue?.contactEmail ?? "",
  });

  const [showErrors, setShowErrors] = useState(false);

  const mandatoryError = "Campo de preenchimento obrigatório";

  const nameError = !name ? mandatoryError : undefined;

  const descriptionError = !description
    ? mandatoryError
    : description.length < 150
      ? "A descrição deve ter pelo menos 150 caracteres"
      : undefined;

  const addressError =
    !location || !address
      ? mandatoryError
      : !address.street1 || !address.postalCode || !address.city
        ? "Por favor indique a morada, o código postal e a cidade"
        : undefined;

  const photosError = photos.length === 0 ? mandatoryError : undefined;

  const billingError = Object.values(billing).every((value) => !value)
    ? mandatoryError
    : Object.entries(billing).some(
          ([name, value]) => !value && name !== "emailValid",
        )
      ? "Por favor preencha todos os campos"
      : !billing.emailValid
        ? "Por favor insira um email válido"
        : undefined;

  const contactError = Object.values(contact).every((value) => !value)
    ? mandatoryError
    : Object.entries(contact).some(
          ([name, value]) => !value && name !== "emailValid",
        )
      ? "Por favor preencha todos os campos"
      : !isValidPhone({
            extension: contact.phoneExtension,
            number: contact.phoneNumber,
          })
        ? "Por favor insira um telemóvel válido"
        : !contact.emailValid
          ? "Por favor insira um email válido"
          : undefined;

  const [nameRef, nameScrollIntoView] = useScrollIntoView<HTMLDivElement>();
  const [descriptionRef, descriptionScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [addressRef, addressScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [sleepingParkingRef, sleepingParkingScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [photosRef, photosScrollIntoView] = useScrollIntoView<HTMLDivElement>();
  const [billingRef, billingScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();
  const [contactRef, contactScrollIntoView] =
    useScrollIntoView<HTMLDivElement>();

  return {
    name,
    setName,
    nameError,
    nameRef,
    nameScrollIntoView,
    description,
    setDescription,
    descriptionError,
    descriptionRef,
    descriptionScrollIntoView,
    address,
    debouncedAddress,
    setAddress,
    location,
    setLocation,
    addressError,
    addressRef,
    addressScrollIntoView,
    sleeping,
    setSleeping,
    parking,
    setParking,
    sleepingParkingRef,
    sleepingParkingScrollIntoView,
    photos,
    setPhotos,
    photosError,
    photosRef,
    photosScrollIntoView,
    billing,
    setBilling,
    billingError,
    billingRef,
    billingScrollIntoView,
    contact,
    setContact,
    contactError,
    contactRef,
    contactScrollIntoView,
    showErrors,
    setShowErrors,
    hasErrors:
      !!nameError ||
      !!descriptionError ||
      !!addressError ||
      !!photosError ||
      !!billingError ||
      !!contactError,
  };
};

type Step1State = ReturnType<typeof useStep1State>;

export const Step1Form = ({
  step1State,
  venue,
}: {
  step1State?: Step1State;
  venue?: Venue;
}) => {
  return (
    <div className={block()}>
      <div className={element("intro")}>
        {venue?.isServicesJourney ? (
          <IllustrationOnboardingServicesStep1 />
        ) : (
          <IllustrationOnboardingStep1 />
        )}
        {venue?.isInProgress ? (
          <TextBlock
            microtitle="Passo 1"
            title={
              venue?.isServicesJourney
                ? "Fale-nos da sua empresa"
                : "Fale-nos do seu local"
            }
            body={
              venue?.isServicesJourney
                ? "Neste passo, iremos pedir-lhe para descrever a sua empresa e indicar algumas informações."
                : "Neste passo, iremos pedir-lhe para descrever o seu local, indicar algumas comodidades e anexar até 4 fotografias."
            }
          />
        ) : (
          <TextBlock
            title={
              venue?.isServicesJourney ? "Editar a empresa" : "Editar o local"
            }
          />
        )}
      </div>

      <div ref={step1State?.nameRef}>
        <Name
          name={step1State?.name}
          setName={step1State?.setName}
          label={
            venue?.isServicesJourney
              ? "Qual o nome da empresa?"
              : "Qual o nome do local?"
          }
          tip={
            venue?.isServicesJourney
              ? undefined
              : `Um local é um agregador de espaços. Por exemplo, um restaurante pode ter várias salas para alugar em separado. Nesse caso, o restaurante é o local e as salas são os espaços. Mais à frente irá dar os detalhes destes espaços e são eles que irão aparecer aos clientes. No caso do seu "local" só ter um "espaço" não há problema. Coloque aqui o nome pelo qual o local é conhecido pelos clientes.`
          }
          ariaLabel={
            venue?.isServicesJourney ? "Nome da empresa" : "Nome do local"
          }
          error={step1State?.showErrors ? step1State.nameError : undefined}
        />
      </div>

      <div ref={step1State?.descriptionRef}>
        <Description
          description={step1State?.description}
          setDescription={step1State?.setDescription}
          subtitle={
            venue?.isServicesJourney
              ? "Descreva resumidamente a história da empresa"
              : "Em seguida, vamos descrever o local"
          }
          label={venue?.isServicesJourney ? undefined : "Crie a sua descrição."}
          body={
            venue?.isServicesJourney
              ? "Partilhe o que torna a sua empresa especial."
              : "Partilhe o que torna o seu local especial."
          }
          tip={
            venue?.isServicesJourney
              ? 'Escreva uma descrição clara, envolvente e informativa, criando uma imagem visualmente rica dos serviços prestados. Exemplo: "Com mais de 10 anos de experiência no mercado, a RINU Catering, já serviu nos mais variados eventos, satisfazendo necessidades e conquistando a credibilidade dos públicos mais exigentes. Preparada para atuar em comemoração de qualquer porte, surpreende pela excelência e criatividade dos seus serviços."'
              : "Escreva uma descrição clara, envolvente e informativa, criando uma imagem visualmente rica do lugar. Pode começar por descrever a aparência, realçar as características distintas e partilhar a sua história. Use adjetivos e advérbios descritivos, evitando generalizações."
          }
          ariaLabel={
            venue?.isServicesJourney
              ? "Descrição da empresa"
              : "Descrição do local"
          }
          minChars={150}
          maxChars={600}
          error={
            step1State?.showErrors ? step1State.descriptionError : undefined
          }
        />
      </div>

      <div ref={step1State?.addressRef}>
        <Stack gap="16px">
          <TextBlock
            subtitle={
              venue?.isServicesJourney
                ? "Onde é a sede da sua empresa?"
                : "Onde fica o seu local?"
            }
          />
          {step1State?.showErrors && step1State?.addressError && (
            <InputError error={step1State.addressError} />
          )}
          <InputAddress
            location={step1State?.location}
            address={step1State?.address}
            debouncedAddress={step1State?.debouncedAddress}
            onChangeLocation={step1State?.setLocation}
            onChangeAddress={step1State?.setAddress}
            showErrors={step1State?.showErrors}
            tip={
              venue?.isServicesJourney
                ? "A partir desta morada, calcularemos até que distância podemos sugerir os seus serviços e o valor da deslocação. Esta não será obrigatoriamente a morada fiscal. Os dados fiscais são preenchidos mais abaixo nesta página."
                : undefined
            }
          />
        </Stack>
      </div>

      {venue?.isVenuesJourney && (
        <div ref={step1State?.sleepingParkingRef}>
          <Extras
            sleeping={step1State?.sleeping}
            setSleeping={step1State?.setSleeping}
            parking={step1State?.parking}
            setParking={step1State?.setParking}
          />
        </div>
      )}

      <div ref={step1State?.photosRef}>
        <Photos
          photos={step1State?.photos}
          setPhotos={step1State?.setPhotos}
          max={venue?.isServicesJourney ? 1 : 4}
          minDimensions={
            venue?.isServicesJourney ? undefined : { width: 680, height: 480 }
          }
          subtitle={
            venue?.isServicesJourney
              ? "Faça upload do seu logótipo"
              : "Adicione algumas fotografias do local onde se encontra o espaço"
          }
          body={
            venue?.isServicesJourney
              ? "Vai precisar de adicionar o seu logótipo para que possa ser identificado na plataforma. Se não tiver logótipo adicione aqui uma imagem apelativa da sua empresa."
              : "Vai precisar de adicionar pelo menos uma fotografia para começar. Pode adicionar mais ou fazer alterações mais tarde."
          }
          tip={
            venue?.isServicesJourney ? undefined : (
              <>
                Não adicione aqui fotografias do espaço que os clientes vão
                frequentar. Essas serão adicionadas mais à frente. Aqui adicione
                as fotos do local onde se encontra o espaço que vai colocar na
                RINU.
                <br />
                <br />
                Por exemplo, se o seu espaço é a sala de um restaurante, coloque
                aqui fotografias da fachada do restaurante, da entrada,
                estacionamento ou até da rua onde ele se encontra. Se for a sala
                de um hotel, então coloque aqui fotografias da fachada do hotel
                e de zonas que sejam comuns a outros espaços (estacionamento,
                fotos aéreas do local, hall de entrada, etc..)
              </>
            )
          }
          error={step1State?.showErrors ? step1State.photosError : undefined}
        />
      </div>

      <div ref={step1State?.billingRef}>
        <Billing
          billing={step1State?.billing}
          setBilling={step1State?.setBilling}
          error={step1State?.showErrors ? step1State.billingError : undefined}
          tip={
            venue?.isServicesJourney
              ? "Coloque os dados fiscais da empresa que presta os serviços. Serão estes os dados que a RINU irá utilizar para faturar a retenção da comissão."
              : "Coloque os dados fiscais da empresa que detém o local/espaço. Serão estes os dados que a RINU irá utilizar para faturar a retenção da comissão."
          }
        />
      </div>

      <div ref={step1State?.contactRef}>
        <Contact
          contact={step1State?.contact}
          setContact={step1State?.setContact}
          error={step1State?.showErrors ? step1State.contactError : undefined}
          label={
            venue?.isServicesJourney
              ? "Quem será a pessoa responsável pela empresa?"
              : "Quem será a pessoa responsável pelo local?"
          }
          tip={
            venue?.isServicesJourney
              ? "Coloque os dados da pessoa responsável pelo serviço e que será o ponto de contacto do cliente. Os dados preenchidos serão partilhados com o cliente assim que o mesmo efectuar a reserva pela RINU."
              : "Coloque os dados da pessoa responsável pelo local e que será o ponto de contacto do cliente. Os dados preenchidos serão partilhados com o cliente assim que o mesmo efectuar a reserva pela RINU."
          }
        />
      </div>
    </div>
  );
};

export default Step1Wrapper;
