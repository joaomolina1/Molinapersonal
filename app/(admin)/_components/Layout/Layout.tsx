"use client";

import { createBEMClasses } from "@/_utils/classname";
import { useSession } from "@/_services/session";
import { useRouter } from "next/navigation";
import AdminHeader from "../Header";
import Footer from "@/_components/Footer";
import { useEffect } from "react";

const { block } = createBEMClasses("admin-layout");

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [session] = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session === null || (!!session && !session.roles.includes("admin"))) {
      router.replace("/");
    }
  }, [router, session]);

  if (!session || !session.roles.includes("admin")) {
    return null;
  }

  return (
    <>
      <AdminHeader />
      <div className={block()}>{children}</div>
      <Footer />
    </>
  );
};

export default AdminLayout;
