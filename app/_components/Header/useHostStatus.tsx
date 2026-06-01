"use client";

import { useVenues } from "@/_models/venue";
import { useSession } from "@/_services/session";

export const useHostStatus = (enabled: boolean = true) => {
  const [session] = useSession();

  const enableHook = enabled && !session?.roles.includes("admin");

  const { data: venues, isLoading: isLoadingVenues } = useVenues({
    enabled: !!session && enableHook,
  });

  if (!enableHook) {
    return null;
  }

  if (session === undefined || isLoadingVenues) {
    return null;
  }

  const isAlreadyHost = !!session && !!venues?.length;

  return {
    isAlreadyHost,
    href: isAlreadyHost
      ? "/host"
      : session
        ? "/onboarding"
        : "?action=register&source=become-host",
  };
};
