import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendário",
  openGraph: {
    title: "Calendário",
    images: "/hero_background.webp",
  },
};

export default function HostCalendar({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
