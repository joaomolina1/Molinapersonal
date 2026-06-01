import { Metadata } from "next";
import QuoteRequestPage from "./QuoteRequestPage";

export const metadata: Metadata = {
  title: "Pedido de Orçamento",
  openGraph: {
    title: "Pedido de Orçamento",
    images: "/contact.jpeg",
  },
};

export default function QuoteRequest() {
  return <QuoteRequestPage />;
}
