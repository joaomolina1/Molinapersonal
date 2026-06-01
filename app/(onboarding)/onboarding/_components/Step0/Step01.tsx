import IconSpacesCateringSpaceCatering from "@/_design_system/_icons/Spaces/Catering/SpaceCatering.svg";
import IconUserInterfaceMiscellaneousVenues from "@/_design_system/_icons/UserInterface/Miscellaneous/Venues.svg";
import IllustrationOnboardingStep01 from "@/_design_system/_illustrations/OnboardingStep01.svg";
import Card from "@/_design_system/Card";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { Journey } from "@/_models/venue";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";

const { block, element } = createBEMClasses("onboarding__step-01");

const mainTitle = "Faça crescer o seu negócio com a RINU";
const mainSubtitle =
  "Dê as boas-vindas ao futuro do seu negócio com a RINU! Descubra novas possibilidades e expanda o seu alcance no mercado de eventos.";
const contentTitle = "Que tipo de negócio gostaria de anunciar?";
const contentSubtitle = "Selecione a opção que melhor descreve o seu serviço";

export const Step01 = ({
  setJourney,
}: {
  setJourney: (journey: Journey) => void;
}) => {
  const isMobile = useMediaQuery("large");

  return (
    <div className={block()}>
      <IllustrationOnboardingStep01 />
      <Stack className={element("content")}>
        {isMobile ? (
          <TextBlock title={mainTitle} body={mainSubtitle} />
        ) : (
          <TextBlock microtitle={mainTitle} title={mainSubtitle} />
        )}
        <Stack className={element("content__steps")}>
          {isMobile ? (
            <TextBlock subtitle={contentTitle} body={contentSubtitle} />
          ) : (
            <TextBlock subtitle={contentTitle} body={contentSubtitle} />
          )}
          <Card
            type="button"
            icon={<IconUserInterfaceMiscellaneousVenues />}
            text="Espaços para eventos"
            microcopy="Dê versatilidade ao seu espaço e atraia todo o tipo de eventos"
            iconAlignment="top"
            onClick={() => setJourney("venues")}
          >
            <p className={element("content__steps__card-custom")}>
              Hotel, Restaurante, Quinta, Co-working, entre outros
            </p>
          </Card>
          <Card
            type="button"
            icon={<IconSpacesCateringSpaceCatering />}
            text="Serviços para eventos"
            microcopy="Seja o parceiro ideal para todos os tipos de eventos"
            iconAlignment="top"
            onClick={() => setJourney("services")}
          >
            <p className={element("content__steps__card-custom")}>
              Caterings, Fotógrafos, Músicos, entre outros
            </p>
          </Card>
        </Stack>
      </Stack>
    </div>
  );
};
