// Marketing content for the partner subscription-plans zone on /help-host.
// Kept separate from app/_constants/plans.ts (which drives the host cockpit
// upgrade modal and Stripe checkout) so the landing copy can be richer
// without affecting the transactional flow.

export type Tone = "neutral" | "premium" | "expert";

export type PlanFeature = {
  label: string;
  sub?: string;
  highlight?: boolean;
};

export type LandingPlan = {
  id: "standard" | "premium" | "expert";
  name: string;
  perVenue?: boolean;
  subtitle: string;
  priceMonthly: number | null; // null = free
  priceAnnual: number | null;
  note: string;
  ribbon?: string;
  tone: Tone;
  featured?: boolean;
  coreFeatures: PlanFeature[];
  extraLabel?: string;
  extraFeatures: PlanFeature[];
  cta: "host" | "demo";
};

export const ANNUAL_SAVE_LABEL = "-12% no anual";

export const LANDING_PLANS: LandingPlan[] = [
  {
    id: "standard",
    name: "Standard",
    subtitle: "Entrada gratuita para presença na RINU.",
    priceMonthly: null,
    priceAnnual: null,
    note: "Sem compromisso. Advertising para Portugal.",
    tone: "neutral",
    coreFeatures: [
      { label: "Venues, Espaços e packs", sub: "Ilimitado" },
      { label: "Gestão de reservas", sub: "Sim" },
      { label: "Integração de Calendário (iCal)", sub: "Sim" },
      { label: "Suporte email RINU", sub: "Sim" },
      { label: "Leads", sub: "Orgânico" },
      { label: "Comissão de reserva", sub: "10%" },
      { label: "Advertising", sub: "Portugal" },
    ],
    extraFeatures: [],
    cta: "host",
  },
  {
    id: "premium",
    name: "Premium",
    perVenue: true,
    subtitle:
      "Para espaços com tickets médios mais baixos. Sem reunião, ativação imediata.",
    priceMonthly: 49.99,
    priceAnnual: 528,
    note: "Inclui 3 leads qualificadas/mês. Advertising Europa.",
    ribbon: "Mais escolhido",
    tone: "premium",
    featured: true,
    coreFeatures: [
      { label: "Venues, Espaços e packs", sub: "Ilimitado" },
      { label: "Gestão de reservas", sub: "Sim" },
      { label: "Integração de Calendário (iCal)", sub: "Sim" },
      {
        label: "Comissão de reserva",
        sub: "7,5% — 0% na 1.ª conversão do ano",
      },
      { label: "Link redes sociais", sub: "Sim" },
      { label: "Advertising", sub: "Europa" },
    ],
    extraLabel: "Funcionalidades premium",
    extraFeatures: [
      { label: "Garantia de leads", sub: "3 leads qualificadas / mês" },
      { label: "Posição destacada", sub: "a partir da 8.ª posição" },
      { label: "Campanhas exclusivas rinu.pt", sub: "Sim" },
      { label: "Acesso a contactos de clientes interessados" },
      { label: "Reports & Insights de mercado", sub: "1 relatório / ano" },
      {
        label: "AI Agent Taylor Made",
        sub: "propostas de eventos personalizadas",
        highlight: true,
      },
      {
        label: "Integração PMS",
        sub: "Opera, The Fork, etc.*",
        highlight: true,
      },
      {
        label: "Partilha de comissão de fornecedores RINU",
        sub: "5% back",
        highlight: true,
      },
      {
        label: "Posicionamento AEO",
        sub: "reinvestimento de 10% da subscrição",
        highlight: true,
      },
      {
        label: "Shooting para redes sociais",
        sub: "1 sessão/ano (plano anual)",
      },
      { label: "Mobile & email marketing", sub: "Sim" },
      { label: "Crossell de fornecedores RINU", sub: "Sim" },
    ],
    cta: "host",
  },
  {
    id: "expert",
    name: "Expert",
    perVenue: true,
    subtitle:
      "Para grandes espaços. Acompanhamento dedicado com account RINU.",
    priceMonthly: 99.99,
    priceAnnual: 1056,
    note: "Inclui 10 leads qualificadas/mês. Advertising Mundial.",
    ribbon: "Top performance",
    tone: "expert",
    coreFeatures: [
      { label: "Tudo do Premium, mais:" },
      {
        label: "Comissão de reserva",
        sub: "5% — 0% nas primeiras 2 conversões do ano",
      },
      { label: "Advertising", sub: "Mundial" },
    ],
    extraLabel: "Funcionalidades expert",
    extraFeatures: [
      { label: "Garantia de leads", sub: "10 leads / mês" },
      {
        label: "Leads filtradas",
        sub: "maior taxa de conversão",
        highlight: true,
      },
      {
        label: "Exclusividade da Montra",
        sub: "posições exclusivas",
        highlight: true,
      },
      {
        label: "1.ª prioridade na Página de Oferta",
        sub: "até 3 espaços",
      },
      { label: "Destaque na Página Inicial**", sub: "1.ª prioridade" },
      { label: "Contactos da venue visíveis na plataforma" },
      { label: "SEO + Georeferenciação + destaque redes RINU" },
      { label: "Account dedicado da equipa rinu.pt" },
      { label: "Visita Virtual*" },
      { label: "Plantas do local", sub: "Sim" },
      { label: "Reports & Insights", sub: "1 relatório / trimestre" },
      { label: "Shooting para redes sociais", sub: "2 sessões/ano (plano anual)" },
      {
        label: "Display Ads em resultados de pesquisa",
        sub: "reinvestimento de 10%",
      },
    ],
    cta: "demo",
  },
];

export const PLAN_FOOTNOTES = [
  "* A integração PMS e a Visita Virtual carecem de análise e estão sujeitas a aprovação da equipa técnica RINU.",
  "** Destaques e prioridades podem depender de regras editoriais e disponibilidade de inventário.",
];

export type ShowcaseVisual =
  | "leads"
  | "ai"
  | "visibility"
  | "advertising"
  | "ecosystem"
  | "insights";

export type ShowcasePill = { label: string; tone: Tone };

export type Showcase = {
  visual: ShowcaseVisual;
  reverse?: boolean;
  pills: ShowcasePill[];
  title: string;
  body: string;
  bullets: string[];
};

export const SHOWCASE: Showcase[] = [
  {
    visual: "leads",
    pills: [
      { label: "Leads mensais", tone: "neutral" },
      { label: "Premium: 3 / mês", tone: "premium" },
      { label: "Expert: 10 / mês filtradas", tone: "expert" },
    ],
    title: "Garantia de leads qualificadas, todos os meses",
    body: "Em vez de picos de procura imprevisíveis, beneficia de um mínimo garantido de leads qualificadas por mês, com intenção real de reserva. No Expert, as leads são ainda filtradas para maior taxa de conversão.",
    bullets: [
      "Qualificadas = pedidos com contexto (datas, tipo de evento, capacidade, orçamento).",
      "Filtradas no Expert: matching avançado com o perfil do espaço para fechar mais com menos esforço.",
      "Previsibilidade para gerir pipeline e ocupação ao longo do ano.",
    ],
  },
  {
    visual: "ai",
    reverse: true,
    pills: [
      { label: "AI Agent", tone: "neutral" },
      { label: "Premium: Sim", tone: "premium" },
      { label: "Expert: Sim", tone: "expert" },
    ],
    title: "Propostas Taylor Made com o AI Agent RINU",
    body: "O nosso agente de inteligência artificial recebe pedidos de clientes e gera automaticamente propostas personalizadas para o seu espaço, acelerando o tempo de resposta e a taxa de conversão.",
    bullets: [
      "Matching inteligente: cruzamento automático entre pedido do cliente e características do espaço.",
      "Proposta gerada em segundos: capacidade, menu, AV, estimativa de preço — pronto a enviar.",
      "Menos tempo de resposta, mais conversões fechadas.",
    ],
  },
  {
    visual: "visibility",
    pills: [
      { label: "Visibilidade", tone: "neutral" },
      { label: "Premium: Oferta 8.ª+ · Europa", tone: "premium" },
      { label: "Expert: Montra exclusiva · Mundial", tone: "expert" },
    ],
    title: "Visibilidade e exclusividade onde as decisões acontecem",
    body: "Nos planos Premium e Expert, o seu espaço beneficia de posições premium nas listagens relevantes. No Expert, inclui ainda exclusividade da Montra — posições reservadas e visibilidade na Página Inicial.",
    bullets: [
      "Premium: destaque na Página de Oferta a partir da 8.ª posição + Advertising Europa.",
      "Expert: 1.ª prioridade absoluta, Montra exclusiva, Página Inicial e Advertising Mundial.",
      "SEO + Georeferenciação: visibilidade orgânica reforçada no Expert.",
    ],
  },
  {
    visual: "advertising",
    reverse: true,
    pills: [
      { label: "Advertising", tone: "neutral" },
      { label: "Premium: Europa + AEO", tone: "premium" },
      { label: "Expert: Mundial + AEO + Display", tone: "expert" },
    ],
    title: "Posicionamento AEO e Advertising global",
    body: "A RINU reinveste 10% da sua subscrição em posicionamento AEO (Answer Engine Optimization) — visibilidade nos motores de resposta por IA. O Expert adiciona ainda Display Ads em resultados de pesquisa.",
    bullets: [
      "AEO: o seu espaço é sugerido por motores de IA quando clientes pesquisam venues em Portugal/Europa.",
      "Advertising Europa (Premium) ou Mundial (Expert) para alcance internacional.",
      "Display Ads no Expert: anúncios visuais em pesquisa com reinvestimento automático de 10%.",
    ],
  },
  {
    visual: "ecosystem",
    pills: [
      { label: "Ecossistema", tone: "neutral" },
      { label: "Premium: Sim", tone: "premium" },
      { label: "Expert: Sim", tone: "expert" },
    ],
    title: "Partilha de comissão e integração com o seu software",
    body: "Nos planos pagos, a RINU partilha 5% de comissão back nas reservas realizadas através de fornecedores da rede RINU. Adicionalmente, é possível integrar o seu software PMS para gerir tudo numa só plataforma.",
    bullets: [
      "5% back: comissão devolvida em reservas via fornecedores RINU (catering, AV, decoração, etc.).",
      "Integração PMS: compatível com Opera, The Fork e outros sistemas de gestão.",
      "Crossell: acesso a fornecedores RINU para enriquecer a oferta de eventos.",
    ],
  },
  {
    visual: "insights",
    reverse: true,
    pills: [
      { label: "Decisão", tone: "neutral" },
      { label: "Premium: 1 relatório / ano", tone: "premium" },
      { label: "Expert: 1 relatório / trimestre", tone: "expert" },
    ],
    title: "Insights de mercado para otimizar oferta e ocupação",
    body: "Recebe relatórios com sinais de mercado para apoiar a otimização de posicionamento, momentos de promoção e foco comercial.",
    bullets: [
      "Tendências de procura e temas com maior tração.",
      "Leituras acionáveis sobre o que priorizar e como comunicar.",
      "Cadência trimestral no Expert para execução contínua ao longo do ano.",
    ],
  },
];

export type PlanFaq = { q: string; tag: string; a: string };

export const PLAN_FAQS: PlanFaq[] = [
  {
    q: "Os planos Premium e Expert são faturados “por venue”?",
    tag: "Sim.",
    a: "Sim. O valor aplica-se por venue, permitindo adequar o investimento ao portfólio e ao retorno esperado para cada operação.",
  },
  {
    q: "Preciso de reunião para ativar o Premium?",
    tag: "Não.",
    a: "Não. O plano Premium foi desenhado para ativação imediata e autónoma — preenche o formulário, escolhe faturação mensal ou anual, e fica ativo sem necessidade de reunião. O Expert inclui acompanhamento dedicado com a equipa RINU.",
  },
  {
    q: "O que significa “leads qualificadas”?",
    tag: "Intenção real de reserva.",
    a: "Pedidos com informação suficiente e alinhados com a oferta (capacidade, contexto do evento, datas/horários e expectativa de orçamento). No Expert, as leads são ainda filtradas por matching avançado com o perfil do espaço, aumentando a taxa de conversão.",
  },
  {
    q: "Como funcionam as comissões?",
    tag: "Variam com o plano.",
    a: "A comissão de reserva é de 10% no Standard, 7,5% no Premium (com 0% na 1.ª conversão do ano) e 5% no Expert (com 0% nas primeiras 2 conversões do ano). Adicionalmente, nos planos pagos recebe 5% back em reservas realizadas via fornecedores da rede RINU.",
  },
  {
    q: "O que é o posicionamento AEO?",
    tag: "Visibilidade em IA.",
    a: "AEO (Answer Engine Optimization) garante que o seu espaço é sugerido quando utilizadores pesquisam venues em motores de resposta por IA (ChatGPT, Perplexity, Google AI Overviews). A RINU reinveste 10% da sua subscrição neste posicionamento automaticamente.",
  },
  {
    q: "O shooting está incluído na mensalidade?",
    tag: "Associado ao anual.",
    a: "O shooting está associado ao pagamento anual. No Expert anual, o pacote inclui 2 sessões.",
  },
  {
    q: "O que é a integração PMS?",
    tag: "Sujeito a aprovação.",
    a: "Integração da gestão de reservas com software próprio (Opera, The Fork, etc.) para gestão numa só plataforma. Sujeito a análise e aprovação da equipa técnica RINU.",
  },
];
