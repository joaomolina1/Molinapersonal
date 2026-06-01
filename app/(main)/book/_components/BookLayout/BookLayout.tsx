"use client";

import { PrimaryHeader } from "@/_components/Header";
import { useSession } from "@/_services/session";
import { createBEMClasses } from "@/_utils/classname";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const { block } = createBEMClasses("book-layout");

const BookLayout = ({ children }: { children: React.ReactNode }) => {
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
    <div className={block()}>
      <PrimaryHeader />
      {children}
    </div>
  );
};

export default BookLayout;
