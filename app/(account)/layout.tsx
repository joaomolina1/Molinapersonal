import { Metadata } from "next";
import AccountLayout from "./_components/AccountLayout";

export const metadata: Metadata = {
  title: "Gerir conta",
  openGraph: {
    title: "Gerir conta",
    images: "/hero_background.webp",
  },
};

export default function Account({ children }: { children: React.ReactNode }) {
  return <AccountLayout>{children}</AccountLayout>;
}
