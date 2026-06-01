import { Metadata } from "next";
import ContactRequestPage from "./ContactRequestPage";

export const metadata: Metadata = {
  title: "Contactar espaço",
  openGraph: {
    title: "Contactar espaço",
    images: "/contact.jpeg",
  },
};

export default function ContactRequest() {
  return <ContactRequestPage />;
}
