import { Metadata } from "next";
import { PrimaryHeader } from "@/_components/Header";
import Footer from "@/_components/Footer";

export const metadata: Metadata = {
  title: "Monte o seu evento",
  description:
    "Diga-nos o que procura e montamos o seu evento passo a passo: espaços, packs e serviços com o preço sempre à vista.",
  openGraph: {
    title: "Monte o seu evento",
    images: "/hero_background.webp",
  },
};

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="builder-layout">
      <PrimaryHeader />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
