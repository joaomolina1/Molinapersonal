import IconSpacesCateringSpaceCatering from "@/_design_system/_icons/Spaces/Catering/SpaceCatering.svg";
import IconSpacesTypeOfSpaceExclusiveSpace from "@/_design_system/_icons/Spaces/TypeOfSpace/ExclusiveSpace.svg";
import IconUserInterfaceMiscellaneousLoop from "@/_design_system/_icons/UserInterface/Miscellaneous/Loop.svg";
import IconUserInterfaceMiscellaneousPacks from "@/_design_system/_icons/UserInterface/Miscellaneous/Packs.svg";
import IconUserInterfaceMiscellaneousVenues from "@/_design_system/_icons/UserInterface/Miscellaneous/Venues.svg";
import IllustrationOnboardingStep02 from "@/_design_system/_illustrations/OnboardingStep02.svg";
import Card from "@/_design_system/Card";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { Journey } from "@/_models/venue";
import { createBEMClasses } from "@/_utils/classname";

const { block, element } = createBEMClasses("onboarding__step-02");

const title = "Está a um passo de começar!";
const subTitle = {
  services:
    "Apresente-nos a sua empresa, os serviços que oferece e os packs associados a cada serviço. Uma empresa poderá ter vários serviços diferentes associados e cada serviço poderá conter packs para criar uma oferta única e personalizada!",
  venues:
    "Apresente-nos os seus locais, os espaços que cada local tem disponíveis para rentabilizar e os packs associados a cada espaço. Um local poderá ter vários espaços diferentes associados (ex.: o local é um hotel e os espaços são o rooftop, a sala de conferências e o bar) e cada espaço poderá conter múltiplos packs para criar uma oferta única e personalizada!",
};

export const Step02 = ({ journey }: { journey: Journey }) => {
  return (
    <div className={block()}>
      <IllustrationOnboardingStep02 />
      <Stack className={element("content")}>
        <div className="hide-desktop-large">
          <TextBlock title={title} body={subTitle[journey]} />
        </div>
        <div className="hide-mobile-large">
          <TextBlock title={title} subtitle={subTitle[journey]} />
        </div>
        {(journey === "venues" ? stepsForVenues : stepsForServices).map(
          (step, index) => (
            <Card
              key={index}
              type="display"
              size="large"
              icon={step.icon}
              iconAlignment="center"
              text={step.text}
              microcopy={step.microcopy}
            />
          ),
        )}
      </Stack>
    </div>
  );
};

const stepsForVenues = [
  {
    icon: <IconUserInterfaceMiscellaneousVenues />,
    text: "Passo 1",
    microcopy: "Fale-nos do seu local (ex: Hotel VilaRinu)",
  },
  {
    icon: <IconSpacesTypeOfSpaceExclusiveSpace />,
    text: "Passo 2",
    microcopy: "Adicione um espaço associado ao local (ex: Sala de reuniões)",
  },
  {
    icon: <IconSpacesCateringSpaceCatering />,
    text: "Passo 3",
    microcopy: "Permissões e características do espaço",
  },
  {
    icon: <IconUserInterfaceMiscellaneousPacks />,
    text: "Passo 4",
    microcopy: "Packs disponíveis no espaço",
  },
  {
    icon: <IconUserInterfaceMiscellaneousLoop />,
    text: "Passo 5",
    microcopy: "Adicione mais espaços e respetivos packs",
  },
];

const stepsForServices = [
  {
    icon: <IconUserInterfaceMiscellaneousVenues />,
    text: "Passo 1",
    microcopy: "Fale-nos da sua empresa (Ex: Rinu Catering & Bar)",
  },
  {
    icon: <IconSpacesTypeOfSpaceExclusiveSpace />,
    text: "Passo 2",
    microcopy: "Adicione um serviço associado à sua empresa (Ex: Catering)",
  },
  {
    icon: <IconUserInterfaceMiscellaneousPacks />,
    text: "Passo 3",
    microcopy:
      "Packs e extras disponíveis no serviço (Ex: Catering 2 pratos em buffet)",
  },
  {
    icon: <IconUserInterfaceMiscellaneousLoop />,
    text: "Passo 4",
    microcopy: "Adicione mais serviços e packs à sua empresa",
  },
];
