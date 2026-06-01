"use client";

import { useSession } from "@/_services/session";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const OnboardingLayout = ({ children }: { children: React.ReactNode }) => {
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

  return children;
};

export default OnboardingLayout;
