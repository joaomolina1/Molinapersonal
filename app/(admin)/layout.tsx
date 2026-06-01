import { Metadata } from "next";
import AdminLayoutComponent from "./_components/Layout";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
}
