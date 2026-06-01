"use client";

import { useSession } from "@/_services/session";
import { createBEMClasses } from "@/_utils/classname";
import { useRouter } from "next/navigation";
import AccountHeader from "../Header";
import { useEffect } from "react";

const { block } = createBEMClasses("account-layout");

const AccountLayout = ({ children }: { children: React.ReactNode }) => {
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
      <AccountHeader />
      <div className={block()}>{children}</div>
    </>
  );
};

export default AccountLayout;
