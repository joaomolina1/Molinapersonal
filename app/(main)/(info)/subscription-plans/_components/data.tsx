import { ReactNode } from "react";
import IconUserInterfaceMiscellaneousPromote from "@/_design_system/_icons/UserInterface/Miscellaneous/Promote.svg";
import IconUserInterfaceMiscellaneousUsers from "@/_design_system/_icons/UserInterface/Miscellaneous/Users.svg";
import IconUserInterfaceMiscellaneousChat from "@/_design_system/_icons/UserInterface/Miscellaneous/Chat.svg";
import IconUserInterfaceMiscellaneousEarnings from "@/_design_system/_icons/UserInterface/Miscellaneous/Earnings.svg";
import IconUserInterfaceMiscellaneousRating from "@/_design_system/_icons/UserInterface/Miscellaneous/Rating.svg";
import IconUserInterfaceMiscellaneousDashboardBlocks from "@/_design_system/_icons/UserInterface/Miscellaneous/DashboardBlocks.svg";
import { PlanId } from "@/_constants/plans";

// Marketing copy for the dedicated subscription-plans page. Pricing and the
// per-plan feature lists are driven by app/_constants/plans.ts (the single
// source of truth shared with the host cockpit and Stripe checkout); the
// content here only adds the comparison and highlight context.

export type ComparisonValue = boolean | string;

export type ComparisonRow = {
  label: string;
  values: Record<PlanId, ComparisonValue>;
};

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    label: "Locais, espaços e packs",
    values: { standard: "Ilimitado", premium: "Ilimitado", expert: "Ilimitado" },
  },
  {
    label: "Gestão de reservas",
    values: { standard: true, premium: true, expert: true },
  },
  {
    label: "Integração de calendário (iCal)",
    values: { standard: true, premium: true, expert: true },
  },
  {
    label: "Comissão de reserva",
    values: { standard: "10%", premium: "7,5%", expert: "5%" },
  },
  {
    label: "Equipa do local (colaboradores)",
    values: { standard: false, premium: true, expert: true },
  },
  {
    label: "Event Hub (pedidos de orçamento)",
    values: { standard: false, premium: true, expert: true },
  },
  {
    label: "Prioridade nos pedidos de orçamento",
    values: { standard: false, premium: true, expert: true },
  },
  {
    label: "Leads qualificadas garantidas",
    values: { standard: false, premium: "3 / mês", expert: "10 / mês" },
  },
  {
    label: "Destaque na Página de Oferta",
    values: { standard: false, premium: "1 espaço", expert: "3 espaços" },
  },
  {
    label: "Prioridade na Página de Oferta",
    values: { standard: false, premium: "2.ª", expert: "1.ª" },
  },
  {
    label: "Destaque na Página Inicial",
    values: { standard: false, premium: false, expert: "1 espaço" },
  },
  {
    label: "Integração com software próprio",
    values: { standard: false, premium: false, expert: true },
  },
  {
    label: "Sessões de shooting (plano anual)",
    values: { standard: false, premium: "1 / ano", expert: "1 / ano" },
  },
  {
    label: "Insights de mercado",
    values: { standard: false, premium: "1 / ano", expert: "Trimestral" },
  },
];

export type Highlight = {
  icon: ReactNode;
  title: string;
  description: string;
};

export const HIGHLIGHTS: Highlight[] = [
  {
    icon: <IconUserInterfaceMiscellaneousPromote />,
    title: "Mais leads qualificadas",
    description:
      "Nos planos pagos recebe um mínimo garantido de leads por mês, com intenção real de reserva.",
  },
  {
    icon: <IconUserInterfaceMiscellaneousUsers />,
    title: "Equipa do local",
    description:
      "Convide outros utilizadores RINU para gerir os espaços e packs de cada local.",
  },
  {
    icon: <IconUserInterfaceMiscellaneousChat />,
    title: "Event Hub",
    description:
      "Aceda aos pedidos de orçamento e tenha prioridade quando chegam novos pedidos.",
  },
  {
    icon: <IconUserInterfaceMiscellaneousEarnings />,
    title: "Comissões reduzidas",
    description:
      "A comissão de reserva desce de 10% para 7,5% no Premium e 5% no Expert.",
  },
  {
    icon: <IconUserInterfaceMiscellaneousRating />,
    title: "Conteúdo profissional",
    description:
      "Sessões de shooting para redes sociais incluídas com o pagamento anual.",
  },
  {
    icon: <IconUserInterfaceMiscellaneousDashboardBlocks />,
    title: "Insights de mercado",
    description:
      "Relatórios com tendências de procura e oportunidades por segmento.",
  },
];

export const PLAN_FAQS: { question: string; answer: ReactNode }[] = [
  {
    question: "Os planos Premium e Expert são faturados por venue?",
    answer:
      "Sim. O valor aplica-se por venue, permitindo adequar o investimento ao portfólio e ao retorno esperado para cada local.",
  },
  {
    question: "Posso mudar de plano ou cancelar quando quiser?",
    answer:
      "Sim. Não há fidelização — pode fazer upgrade, downgrade ou cancelar a qualquer momento a partir do seu painel de parceiro.",
  },
  {
    question: "Como funcionam as comissões?",
    answer:
      "A comissão de reserva é de 10% no Standard, 7,5% no Premium (com 0% na 1.ª conversão do ano) e 5% no Expert (com 0% nas primeiras 2 conversões do ano).",
  },
  {
    question: "O que são leads qualificadas garantidas?",
    answer:
      "Pedidos com informação suficiente e alinhados com a sua oferta (capacidade, tipo de evento, datas e expectativa de orçamento). O Premium garante 3 por mês e o Expert 10 por mês.",
  },
  {
    question: "O shooting está incluído na mensalidade?",
    answer:
      "O shooting para redes sociais está associado ao pagamento anual dos planos Premium e Expert.",
  },
];
