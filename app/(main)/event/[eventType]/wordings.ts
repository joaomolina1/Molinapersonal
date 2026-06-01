import { BannerType } from "@/_components/QuoteRequestBanner/bannerData";
import { SpaceEventType } from "@/_constants/space/eventTypes";

export const LANDING_EVENT_TYPES = [
  "corporate-event",
  "birthday",
  "wedding",
] satisfies SpaceEventType[];

export type LandingEventType = (typeof LANDING_EVENT_TYPES)[number];

export const HERO_WORDING = {
  "corporate-event": "para o seu evento corporativo",
  birthday: "para a sua festa de anos",
  wedding: "para o seu casamento",
};

export const TITLE_WORDING = {
  "corporate-event": "Eventos corporativos",
  birthday: "Festas de anos",
  wedding: "Casamentos",
};

export const GUIDE_CONTENT = {
  "corporate-event": {
    intro: "",
    steps: [
      {
        title: "Estabeleça Objetivos Claros",
        text: "Defina os objetivos do evento corporativo, como networking, lançamento de produtos, reconhecimento de funcionários, etc.",
      },
      {
        title: "Defina um Orçamento",
        text: "Determine o orçamento disponível para o evento e aloque fundos para cada aspecto, como localização, catering, entretenimento, etc. Escolha uma Data e Localização Adequadas: Selecione uma data e um local que sejam convenientes para os participantes e que atendam às necessidades logísticas do evento.",
      },
      {
        title: "Elabore uma Lista de Convidados",
        text: "Identifique os participantes-chave que devem ser convidados para o evento com base nos objetivos estabelecidos.",
      },
      {
        title: "Tematize o Evento (Opcional)",
        text: "Se apropriado, escolha um tema que reflita a identidade da empresa ou os objetivos do evento para criar uma atmosfera coesa e memorável.",
      },
      {
        title: "Envie Convites Profissionais",
        text: "Envie convites bem elaborados e profissionais aos participantes, incluindo todas as informações relevantes sobre o evento, como data, hora, localização e agenda.",
      },
      {
        title: "Organize a Logística",
        text: "Certifique-se de que todos os detalhes logísticos estejam planejados, incluindo estacionamento, transporte, equipamentos audiovisuais, etc.",
      },
      {
        title: "Planeie o Programa",
        text: "Desenvolva uma agenda detalhada para o evento, incluindo palestras, apresentações, atividades de networking, etc., e atribua responsáveis por cada segmento.",
      },
      {
        title: "Contrate Serviços Necessários",
        text: "Se necessário, contrate fornecedores para serviços como catering, decoração, fotografia, vídeo, etc., garantindo que sejam profissionais e confiáveis.",
      },
      {
        title: "Prepare Material Promocional",
        text: "Desenvolva material promocional, como banners, folhetos e brindes, para promover a marca da empresa durante o evento.",
      },
      {
        title: "Facilite o Networking",
        text: "Crie oportunidades para os participantes interagirem e fazerem networking durante o evento, como intervalos para café, mesas redondas, etc.",
      },
      {
        title: "Ofereça Entretenimento (Opcional)",
        text: "Se apropriado, inclua entretenimento no evento, como música ao vivo, palestras motivacionais, atividades de team building, etc., para manter os participantes engajados.",
      },
      {
        title: "Registe o Evento",
        text: "Contrate um fotógrafo e/ou videógrafo para registrar o evento e capturar momentos importantes, como palestras, premiações, etc., para uso futuro da empresa.",
      },
      {
        title: "Solicite Feedback",
        text: "Após o evento, envie uma pesquisa de satisfação aos participantes para obter feedback sobre a experiência e identificar áreas de melhoria para eventos futuros.",
      },
      {
        title: "Avalie o Sucesso do Evento",
        text: "Analise os resultados do evento com base nos objetivos estabelecidos e no feedback recebido, avaliando o retorno sobre o investimento e a eficácia geral.",
      },
    ],
    goodbye: "",
  },
  birthday: {
    intro: "",
    steps: [
      {
        title: "Estabeleça um Orçamento",
        text: "Defina quanto está disposto a gastar na festa para orientar suas decisões em relação ao local, decoração, comida, entretenimento, etc.",
      },
      {
        title: "Escolha uma Data e Localização",
        text: "Determine a data e o local da festa com antecedência para garantir disponibilidade e permitir que os convidados planejem com antecedência.",
      },
      {
        title: "Faça uma Lista de Convidados",
        text: "Compile uma lista de todos os amigos, familiares e conhecidos que deseja convidar para a festa.",
      },
      {
        title: "Escolha um Tema (Opcional)",
        text: "Se desejar, selecione um tema para a festa que reflita os interesses e gostos do aniversariante. Isso pode orientar as escolhas de decoração, comida e atividades.",
      },
      {
        title: "Envie Convites",
        text: "Envie os convites com antecedência, seja por e-mail, redes sociais ou convites impressos, para garantir que os convidados tenham tempo suficiente para confirmar presença.",
      },
      {
        title: "Planeie a Decoração",
        text: "Decida sobre a decoração da festa, incluindo balões, banners, centros de mesa e quaisquer outros elementos que contribuam para o tema escolhido.",
      },
      {
        title: "Organize o Menu",
        text: "Planeie o menu da festa, incluindo petiscos, pratos principais, sobremesas e bebidas. Considere as preferências alimentares dos convidados ao selecionar as opções.",
      },
      {
        title: "Entretenimento e Atividades",
        text: "Planeie atividades e entretenimento para manter os convidados entretidos durante a festa, como jogos, karaoke, uma pista de dança, etc.",
      },
      {
        title: "Contrate Serviços Necessários",
        text: "Se necessário, contrate serviços como um DJ, fotógrafo, serviço de catering, aluguel de equipamentos de som, etc.",
      },
      {
        title: "Prepare uma Lista de Reprodução",
        text: "Se não contratou um DJ, crie uma lista de reprodução com músicas que o aniversariante e os convidados vão gostar e certifique-se de ter um sistema de som adequado.",
      },
      {
        title: "Considere a Segurança dos Convidados",
        text: "Certifique-se de que o local da festa é seguro para os convidados, especialmente se houver crianças presentes. Tome precauções adicionais se estiver a servir álcool.",
      },
      {
        title: "Tenha um Plano de Contingência para o Clima",
        text: "Se a festa for ao ar livre, tenha um plano de contingência caso o clima não coopere, como uma tenda ou um local alternativo coberto.",
      },
      {
        title: "Prepare uma Lembrança",
        text: "Considere oferecer uma lembrança aos convidados como agradecimento por comparecerem à festa. Pode ser algo simples e relacionado ao tema da festa.",
      },
      {
        title: "Não Se Esqueça do Bolo!",
        text: "Encomende ou faça um bolo especial para o aniversariante e seus convidados. Certifique-se de considerar quaisquer restrições alimentares ao escolher o sabor e os ingredientes.",
      },
      {
        title: "Relaxe e Divirta-se",
        text: "Por fim, lembre-se de relaxar e aproveitar a festa! É um momento especial para celebrar com amigos e familiares, então divirta-se e crie memórias duradouras.",
      },
    ],
    goodbye: "",
  },
  wedding: {
    intro:
      "Planear um casamento é uma etapa emocionante, e uma das decisões mais importantes é escolher o melhor local. O espaço define o cenário e estabelece o clima para o seu grande dia. Aqui está um guia rápido com sugestões para encontrar o espaço ideal para o seu casamento de sonho:",
    steps: [
      {
        title: "Estabeleça um orçamento",
        text: "Antes de começar a procura pelo espaço do casamento, é crucial determinar um orçamento claro. Isso ajudará a limitar as suas opções e garantir que não se empolga com opções que estão além das suas possibilidades financeiras.",
      },
      {
        title: "Considere o estilo do casamento",
        text: "Pense no estilo de casamento que deseja. Se é um casamento ao ar livre, um casamento elegante num salão de festas, ou um casamento rústico num celeiro, o estilo do espaço deve estar de acordo com a visão que tem para o seu grande dia.",
      },
      {
        title: "Faça uma lista de necessidades e desejos",
        text: "Anote todas as necessidades essenciais do seu casamento, como capacidade de convidados, estacionamento, acessibilidade para pessoas com deficiência, etc. Em seguida, liste os desejos, como uma vista panorâmica, jardins bem cuidados, ou uma pista de dança espaçosa.",
      },
      {
        title: "Considere a localização",
        text: "Pense na localização geográfica do espaço em relação à sua cerimónia e recepção. Certifique-se de que seja conveniente para si e para os seus convidados. Considere também a disponibilidade de hotéis próximos para acomodar os convidados que viajam de fora da cidade.",
      },
      {
        title: "Pesquise online",
        text: "Comece a sua pesquisa na RINU de acordo com os seus requisitos. A nossa plataforma é um ótimo recurso para encontrar uma variedade de opções e ler avaliações de outros casais.",
      },
      {
        title: "Agende visitas",
        text: "Quando identificar alguns espaços potenciais, agende visitas para os ver pessoalmente. Isso dará uma melhor sensação do espaço e ajudará a visualizar como será o seu casamento.",
      },
      {
        title: "Faça perguntas",
        text: "Durante as visitas, não hesite em fazer perguntas detalhadas ao coordenador do local. Questões importantes incluem disponibilidade de datas, políticas de cancelamento, custos adicionais, opções de catering, e restrições de decoração.",
      },
      {
        title: "Avalie a capacidade e o layout",
        text: "Certifique-se de que o espaço tenha capacidade suficiente para acomodar todos os seus convidados confortavelmente. Além disso, avalie o layout do espaço para garantir que seja funcional para as atividades planeadas, como a cerimónia, o cocktail e a recepção.",
      },
      {
        title: "Considere os serviços incluídos",
        text: "Alguns espaços oferecem serviços adicionais, como coordenação de eventos, decoração, e até mesmo catering. Avalie se esses serviços adicionais são uma vantagem para si e se eles se encaixam no seu orçamento.",
      },
      {
        title: "Pergunte sobre restrições e regulamentos",
        text: "Certifique-se que entende todas as restrições e regulamentos do espaço, como horários de funcionamento, políticas de barulho, e restrições de decoração. Isso garantirá que não haja surpresas desagradáveis no dia do casamento.",
      },
      {
        title: "Avalie o ambiente e a atmosfera",
        text: "Ao visitar os espaços, preste atenção ao ambiente e à atmosfera. Visualize como será o seu casamento e certifique-se de que corresponde ao que está à procura.",
      },
      {
        title: "Tenha em consideração o clima",
        text: "Se está a planear um casamento ao ar livre, tenha em consideração o clima da região e tenha um plano de backup caso chova. Certifique-se de que o espaço tenha opções para ambas as condições climáticas.",
      },
      {
        title: "Leia os contratos cuidadosamente",
        text: "Antes de assinar qualquer contrato, certifique-se de ler cuidadosamente todos os termos e condições. Se houver algo que não entende ou com o qual não concorda, não hesite em pedir esclarecimentos ou fazer alterações.",
      },
      {
        title: "Reserve com antecedência",
        text: "Uma vez que encontrou o espaço perfeito, não demore para fazer a reserva. Os melhores espaços de casamento costumam ser reservados com meses, ou até mesmo anos, de antecedência, especialmente durante os meses de alta temporada.",
      },
      {
        title: "Confirme os detalhes",
        text: "Antes do grande dia, confirme todos os detalhes com o coordenador do local, incluindo horários, disposição do espaço, serviços adicionais, e requisitos especiais.",
      },
    ],
    goodbye:
      "Esperamos que este guia rápido tenha ajudado a encontrar o espaço perfeito para o seu casamento. Com planeamento cuidadoso e pesquisa diligente, pode criar o casamento dos seus sonhos num ambiente que seja verdadeiramente mágico.",
  },
};

export const BANNER_TYPES_FOR_LANDING_EVENTS = {
  birthday: ["birthday", "children-birthday"],
  "corporate-event": ["corporate-event"],
  wedding: undefined,
} satisfies Record<LandingEventType, BannerType[] | undefined>;
