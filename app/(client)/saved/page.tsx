import { Metadata } from "next";
import ClientSavedPage from "./ClientSavedPage";

export const metadata: Metadata = {
  title: "Favoritos",
  openGraph: {
    title: "Favoritos",
    images: "/hero_background.webp",
  },
};

export default function ClientSaved() {
  return <ClientSavedPage />;
}
