"use client";

import { createBEMClasses } from "@/_utils/classname";
import HostHeader from "../Header";
import { useSession } from "@/_services/session";
import { useRouter } from "next/navigation";
import { useAllSpaces } from "@/_models/space";
import { useVenues } from "@/_models/venue";
import Footer from "@/_components/Footer";
import { useEffect } from "react";

const { block } = createBEMClasses("host-layout");

const HostLayout = ({ children }: { children: React.ReactNode }) => {
  const [session] = useSession();
  const router = useRouter();

  const { data: venues, isPending: isPendingVenues } = useVenues({
    enabled: !!session,
  });
  const { data: spaces, isPending: isPendingSpaces } = useAllSpaces();

  const hasHostContent = (venues?.length ?? 0) > 0 || (spaces?.length ?? 0) > 0;

  useEffect(() => {
    if (session === null || (!!session && session.roles.includes("admin"))) {
      router.replace("/");
    }
  }, [router, session]);

  useEffect(() => {
    if (!!venues && !!spaces && venues.length === 0 && spaces.length === 0) {
      router.replace("/onboarding");
    }
  }, [router, venues, spaces]);

  if (
    !session ||
    isPendingVenues ||
    isPendingSpaces ||
    !hasHostContent ||
    session.roles.includes("admin")
  ) {
    return null;
  }

  return (
    <>
      <HostHeader />
      <div className={block()}>{!!session && children}</div>
      <Footer />
    </>
  );
};

export default HostLayout;
