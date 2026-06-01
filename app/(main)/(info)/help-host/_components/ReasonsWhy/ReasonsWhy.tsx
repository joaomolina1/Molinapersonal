"use client";

import { IconButton } from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import Tooltip from "@/_design_system/Tooltip";
import IconUserInterfaceMiscellaneousBackoffice from "@/_design_system/_icons/UserInterface/Miscellaneous/Backoffice.svg";
import IconUserInterfaceMiscellaneousCancellations from "@/_design_system/_icons/UserInterface/Miscellaneous/Cancellations.svg";
import IconUserInterfaceMiscellaneousChat from "@/_design_system/_icons/UserInterface/Miscellaneous/Chat.svg";
import IconUserInterfaceMiscellaneousClock from "@/_design_system/_icons/UserInterface/Miscellaneous/Clock.svg";
import IconUserInterfaceMiscellaneousEarnings from "@/_design_system/_icons/UserInterface/Miscellaneous/Earnings.svg";
import IconUserInterfaceMiscellaneousGraphUp from "@/_design_system/_icons/UserInterface/Miscellaneous/GraphUp.svg";
import IconUserInterfaceMiscellaneousInfo from "@/_design_system/_icons/UserInterface/Miscellaneous/Info.svg";
import IconUserInterfaceMiscellaneousPromote from "@/_design_system/_icons/UserInterface/Miscellaneous/Promote.svg";
import IconUserInterfaceMiscellaneousUsers from "@/_design_system/_icons/UserInterface/Miscellaneous/Users.svg";
import IconUserInterfaceMiscellaneousVenues from "@/_design_system/_icons/UserInterface/Miscellaneous/Venues.svg";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";

const { block, element } = createBEMClasses("help-host-reasons-why");

const ReasonsWhy = () => {
  const isMobile = useMediaQuery("small");

  return (
    <div className={block()}>
      <Stack gap="2rem" className={element("content")}>
        <Stack gap="1rem">
          <h1>Porque se deve tornar num parceiro RINU?</h1>
          <h6>
            Tornar-se um parceiro RINU é a maneira perfeita de maximizar a
            rentabilidade do seu espaço, alcançando uma audiência global que
            procura locais únicos para eventos. Com uma plataforma fácil de usar
            e diversas vantagens exclusivas, oferecemos tudo o que precisa para
            transformar o seu espaço numa opção desejada por clientes
            particulares e corporativos.
          </h6>
        </Stack>
        <div className={element("grid")}>
          {REASONS.map((reason, index) => (
            <div className={element("item")} key={index}>
              <div className={element("item__icon")}>{reason.icon}</div>
              <Stack gap="0.125rem">
                <h5>
                  {reason.title}
                  {isMobile && (
                    <>
                      &nbsp;&nbsp;
                      <Tooltip content={reason.text} visibleOnTouchDevice>
                        <IconButton
                          showTooltip={false}
                          ariaLabel="Detalhe"
                          icon={<IconUserInterfaceMiscellaneousInfo />}
                        />
                      </Tooltip>
                    </>
                  )}
                </h5>
                {!isMobile && <p>{reason.text}</p>}
              </Stack>
            </div>
          ))}
        </div>
      </Stack>
    </div>
  );
};

const REASONS = [
  {
    title: "Anúncio gratuito",
    text: "Sem taxas de inscrição! Crie o seu perfil, adicione espaços, defina a disponibilidade e preços - de forma simples e sem custos.",
    icon: <IconUserInterfaceMiscellaneousVenues />,
  },
  {
    title: "Visibilidade para o seu espaço",
    text: "Mostre o seu espaço para uma audiência global que procura locais para festas, eventos empresariais, reuniões, sessões fotográficas e muito mais.",
    icon: <IconUserInterfaceMiscellaneousPromote />,
  },
  {
    title: "Controlo total",
    text: "Decida quando e como alugar o seu espaço. Sincronize o seu calendário e defina as regras e tipos de eventos que deseja receber.",
    icon: <IconUserInterfaceMiscellaneousBackoffice />,
  },
  {
    title: "Feedback e avaliações",
    text: "Converta reservas em eventos e receba avaliações de clientes. Quanto melhores as suas avaliações, mais visibilidade ganha na nossa plataforma.",
    icon: <IconUserInterfaceMiscellaneousChat />,
  },
  {
    title: "Parceria WIN-WIN",
    text: "Ganhamos apenas quando você ganha. A nossa comissão é em success fee, dependendo do país e do tipo de evento.",
    icon: <IconUserInterfaceMiscellaneousEarnings />,
  },
  {
    title: "Eficiência e simplicidade",
    text: "Reduza o tempo gasto em orçamentos. Configure todas as informações no nosso backoffice e otimize as suas operações.",
    icon: <IconUserInterfaceMiscellaneousClock />,
  },
  {
    title: "Analytics poderosos",
    text: "Melhore continuamente com os nossos insights. Terá acesso a um dashboard com análises detalhadas, com sugestões de melhoria da taxa de conversão.",
    icon: <IconUserInterfaceMiscellaneousGraphUp />,
  },
  {
    title: "Suporte à comunidade",
    text: "Não pode aceitar mais reservas? Recomende-nos e receba uma comissão. Ajude a fortalecer o setor como um todo.",
    icon: <IconUserInterfaceMiscellaneousUsers />,
  },
  {
    title: "Política de cancelamentos flexível",
    text: "Defina a política de cancelamento que quer dar ao cliente e a sua elasticidade de cancelamento consoante o pack de evento.",
    icon: <IconUserInterfaceMiscellaneousCancellations />,
  },
];

export default ReasonsWhy;
