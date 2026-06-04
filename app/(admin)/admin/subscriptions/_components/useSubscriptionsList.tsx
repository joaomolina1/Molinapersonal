import {
  AdminSubscription,
  useSubscriptions,
} from "@/_models/subscription";
import { lowerCaseIncludes } from "@/_utils/text";
import { useState } from "react";

const statusOptions = [
  { id: "all", text: "Todos os estados" },
  { id: "active", text: "Ativo" },
  { id: "incomplete", text: "Incompleto" },
  { id: "past_due", text: "Pagamento em atraso" },
  { id: "canceled", text: "Cancelado" },
] as const;

const planOptions = [
  { id: "all", text: "Todos os planos" },
  { id: "premium", text: "Premium" },
  { id: "expert", text: "Expert" },
] as const;

export const useSubscriptionsList = () => {
  const { data: subscriptions = [] } = useSubscriptions();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statusOptions)[number]["id"]>(
    "all",
  );
  const [plan, setPlan] = useState<(typeof planOptions)[number]["id"]>("all");

  const queryFilter = (sub: AdminSubscription) =>
    lowerCaseIncludes(sub.venueName, query) ||
    lowerCaseIncludes(sub.venueReference, query) ||
    lowerCaseIncludes(sub.ownerEmail, query) ||
    lowerCaseIncludes(sub.venueID, query) ||
    lowerCaseIncludes(sub.stripeSubscriptionID, query);

  const statusFilter = (sub: AdminSubscription) =>
    status === "all" || sub.status === status;

  const planFilter = (sub: AdminSubscription) =>
    plan === "all" || sub.plan === plan;

  const subscriptionsToDisplay = subscriptions
    .filter(queryFilter)
    .filter(statusFilter)
    .filter(planFilter);

  return {
    subscriptions: subscriptionsToDisplay,
    query,
    setQuery,
    status,
    setStatus,
    statusOptions,
    plan,
    setPlan,
    planOptions,
  };
};

export type SubscriptionsList = ReturnType<typeof useSubscriptionsList>;
