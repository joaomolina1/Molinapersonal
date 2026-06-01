"use client";

import { useCookies } from "@/_services/cookies";
import { useSession } from "@/_services/session";
import { GoogleAnalytics, sendGAEvent } from "@next/third-parties/google";
import { useEffect } from "react";

const GoogleAnalyticsWrapper = ({ gaId }: { gaId: string }) => {
  const [session] = useSession();
  const { cookies } = useCookies();

  useEffect(() => {
    if (!cookies || !cookies.analytics) {
      return;
    }

    if (session) {
      sendGAEvent("set", "user_id", session.user_id);
    } else if (session === null) {
      // the gtag here does accept null
      sendGAEvent("set", "user_id", null as unknown as object);
    }
  }, [cookies, session]);

  if (!cookies || !cookies.analytics) {
    return null;
  }

  return <GoogleAnalytics gaId={gaId} />;
};

export default GoogleAnalyticsWrapper;
