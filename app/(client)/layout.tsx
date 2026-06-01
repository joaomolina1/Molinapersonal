import { Metadata } from "next";
import ClientLayout from "./_components/ClientLayout";

export const metadata: Metadata = {
  title: "Reservas",
  openGraph: {
    title: "Reservas",
    images: "/hero_background.webp",
  },
};

export default function Client({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
