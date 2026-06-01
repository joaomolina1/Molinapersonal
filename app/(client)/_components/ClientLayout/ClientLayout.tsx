"use client";

import Footer from "@/_components/Footer";
import { PrimaryHeader } from "@/_components/Header";
import { useSession } from "@/_services/session";
import { createBEMClasses } from "@/_utils/classname";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const { block } = createBEMClasses("client-layout");

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const [session] = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session === null) {
      router.replace("/");
    }
  }, [router, session]);

  if (!session) {
    return null;
  }

  return (
    <>
      <PrimaryHeader />
      <div className={block()}>{children}</div>
      <Footer />
    </>
  );
};

export default ClientLayout;
