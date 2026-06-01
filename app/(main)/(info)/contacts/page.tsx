import { Metadata } from "next";
import ContactsPage from "./ContactsPage";

export const metadata: Metadata = {
  title: "Contactos",
  openGraph: {
    title: "Contactos",
    images: "/contact.jpeg",
  },
};

export default function Contacts() {
  return <ContactsPage />;
}
