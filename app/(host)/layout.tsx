import { Metadata } from "next";
import HostLayout from "./_components/HostLayout";

export const metadata: Metadata = {
  title: {
    template: "Parceiro - %s | RINU",
    default: "Parceiro - Dashboard",
  },
  openGraph: {
    title: {
      template: "Parceiro - %s | RINU",
      default: "Parceiro - Dashboard",
    },
    images: "/hero_background.webp",
  },
};

export default function Host({ children }: { children: React.ReactNode }) {
  return <HostLayout>{children}</HostLayout>;
}
