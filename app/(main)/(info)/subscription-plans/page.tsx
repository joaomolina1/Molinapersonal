import { Metadata } from "next";
import SubscriptionPlansPage from "./SubscriptionPlansPage";

export const metadata: Metadata = {
  title: "Planos de subscrição",
  openGraph: {
    title: "Planos de subscrição",
    images: "/help-host-1.jpeg",
  },
};

export default function SubscriptionPlans() {
  return <SubscriptionPlansPage />;
}
