export type PlanId = "standard" | "premium" | "expert";

export type PlanFeature = {
  label: string;
  note?: string;
};

export type Plan = {
  id: PlanId;
  name: string;
  subtitle: string;
  priceMonthly: number | null; // null = free
  priceAnnual: number | null;
  note?: string;
  badge?: string;
  featured?: boolean;
  coreFeatures: PlanFeature[];
  extraFeaturesLabel?: string;
  extraFeatures: PlanFeature[];
};

export const PLANS: Plan[] = [
  {
    id: "standard",
    name: "Standard",
    subtitle: "Entrada gratuita para presença na RINU.",
    priceMonthly: null,
    priceAnnual: null,
    note: "Sem compromisso. Indicado para começar.",
    coreFeatures: [
      { label: "Venues, Espaços e packs: Ilimitado" },
      { label: "Gestão de reservas: Sim" },
      { label: "Integração de Calendário (iCal): Sim" },
      { label: "Comissão de reserva: 10%" },
    ],
    extraFeatures: [],
  },
  {
    id: "premium",
    name: "Premium",
    subtitle: "Indicado para espaços mais pequenos, com tickets médios mais baixos.",
    priceMonthly: 49,
    priceAnnual: 517,
    note: "No plano anual: desconto 12% + 1 sessão de shooting.",
    badge: "Mais escolhido",
    featured: true,
    coreFeatures: [
      { label: "Venues, Espaços e packs: Ilimitado" },
      { label: "Gestão de reservas: Sim" },
      { label: "Integração de Calendário (iCal): Sim" },
      { label: "Comissão de reserva: 7,5%", note: "0% na 1.ª conversão do ano" },
    ],
    extraFeaturesLabel: "Funcionalidades premium",
    extraFeatures: [
      {
        label: "Equipa do local: convide utilizadores RINU (por email) para gerir espaços e packs desse local",
      },
      { label: "Event Hub: acesso a pedidos de orçamento (contactos mascarados)" },
      {
        label: "Prioridade nos pedidos de orçamento: os seus espaços são priorizados quando chegam novos pedidos",
      },
      { label: "Garantia de leads: 3 leads qualificadas / mês" },
      { label: "Destaque na Página de Oferta: até 1 espaço associado" },
      { label: "Prioridade na Página de Oferta: 2.ª prioridade" },
      { label: "Shooting para redes sociais: 1 sessão/ano (com pagamento anual)" },
      { label: "Insights de mercado: 1 relatório / ano" },
    ],
  },
  {
    id: "expert",
    name: "Expert",
    subtitle: "Indicado para espaços de maior dimensão e tickets médios mais elevados.",
    priceMonthly: 99,
    priceAnnual: 1072,
    note: "No plano anual: desconto 12% + 2 sessões de shooting.",
    coreFeatures: [
      { label: "Venues, Espaços e packs: Ilimitado" },
      { label: "Gestão de reservas: Sim" },
      { label: "Integração de Calendário (iCal): Sim" },
      { label: "Comissão de reserva: 5%", note: "0% nas primeiras 2 conversões do ano" },
      { label: "Integração com software próprio: Sim (sujeito a aprovação)" },
    ],
    extraFeaturesLabel: "Funcionalidades expert",
    extraFeatures: [
      {
        label: "Equipa do local: convide utilizadores RINU (por email) para gerir espaços e packs desse local",
      },
      { label: "Event Hub: acesso a pedidos de orçamento (contactos mascarados)" },
      {
        label: "Prioridade nos pedidos de orçamento: os seus espaços são priorizados quando chegam novos pedidos",
      },
      { label: "Garantia de leads: 10 leads qualificadas / mês" },
      { label: "Destaque na Página de Oferta: até 3 espaços associados" },
      { label: "Prioridade na Página de Oferta: 1.ª prioridade" },
      { label: "Destaque na Página Inicial: até 1 espaço associado" },
      { label: "Prioridade na Página Inicial: 1.ª prioridade" },
      { label: "Shooting para redes sociais: 1 sessão/ano (com pagamento anual)" },
      { label: "Insights de mercado: 1 relatório / trimestre" },
    ],
  },
];

export const ANNUAL_DISCOUNT_LABEL = "-12% no anual";

export const getPlan = (id: PlanId) => PLANS.find((plan) => plan.id === id);
