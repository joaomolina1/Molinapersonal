import { Metadata } from "next";
import HelpHostPage from "./HelpHostPage";

export const metadata: Metadata = {
  title: "Vantagens do parceiro",
  openGraph: {
    title: "Vantagens do parceiro",
    images: "/help-host-1.jpeg",
  },
};

export default function HelpHost() {
  return <HelpHostPage />;
}
