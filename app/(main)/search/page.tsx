import SearchPage from "@/(main)/search/_components/SearchPage";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Espaços para eventos",
  description: "Alugar os melhores espaços para qualquer tipo de evento.",
  openGraph: {
    title: "Espaços para eventos",
    images: "/hero_background.webp",
    description: "Alugar os melhores espaços para qualquer tipo de evento.",
  },
};

export default function Search() {
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  );
}
