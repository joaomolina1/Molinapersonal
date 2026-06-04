import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Hub",
};

export default function EventHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
