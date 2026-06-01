import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reservas",
  openGraph: {
    title: "Reservas",
    images: "/hero_background.webp",
  },
};

export default function HostBookings({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
