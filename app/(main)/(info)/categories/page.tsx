import { Metadata } from "next";
import SearchCategoriesPage from "./SearchCategoriesPage";

export const metadata: Metadata = {
  title: "Categorias de eventos",
  openGraph: {
    title: "Categorias de eventos",
    images: "/hero_background.webp",
  },
};

export default function Contacts() {
  return <SearchCategoriesPage />;
}
