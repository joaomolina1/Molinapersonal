import { Metadata } from "next";
import OnboardingLayout from "./_components/OnboardingLayout";

export const metadata: Metadata = {
  title: "Registar Espaço",
  openGraph: {
    title: "Registar Espaço",
    images: "/hero_background.webp",
  },
};

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingLayout>{children}</OnboardingLayout>;
}
