import { Suspense } from "react";
import { Metadata } from "next";
import SearchSpacePageWrapper from "./_components/SearchSpacePageWrapper";

export const metadata: Metadata = {
  title: "Espaços para eventos",
  openGraph: {
    title: "Alugar os melhores espaços para qualquer tipo de evento.",
    images: "/hero_background.webp",
  },
};

export default function SearchSpace() {
  return (
    <Suspense fallback={null}>
      <SearchSpacePageWrapper />
    </Suspense>
  );
}
