import { Metadata } from "next";
import BookLayout from "./_components/BookLayout";

export const metadata: Metadata = {
  title: "Concluir reserva",
  openGraph: {
    title: "Concluir reserva",
    images: "/hero_background.webp",
  },
};

export default function Book({ children }: { children: React.ReactNode }) {
  return <BookLayout>{children}</BookLayout>;
}
