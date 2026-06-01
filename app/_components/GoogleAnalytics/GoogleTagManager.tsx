"use client";

import { useCookies } from "@/_services/cookies";
import { useSession } from "@/_services/session";
import {
  GoogleTagManager,
  sendGAEvent,
  sendGTMEvent,
} from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const sessionId = uuidv4();

const getParamsForPathname = (pathname: string) => {
  const searchParams = new URLSearchParams(window.location.search);

  if (pathname === "/") {
    return { Rinu_ItemType: "standard" };
  }

  if (pathname === "/categories") {
    return { Rinu_ItemType: "space_category" };
  }

  if (pathname === "/search") {
    return {
      Rinu_eLabel3: searchParams.get("eventType"),
      Rinu_eLabel4: searchParams.get("city"),
      Rinu_eLabel5: searchParams.get("date")
        ? `${searchParams.get("date")}: ${searchParams.get(
            "start",
          )}-${searchParams.get("end")}`
        : null,
      Rinu_eLabel6: searchParams.get("numPeople"),
      Rinu_eLabel7: searchParams.get("attributes"),
      Rinu_eLabel8: searchParams.get("category"),
    };
  }

  if (pathname.startsWith("/event/")) {
    return {
      Rinu_ScreenName: "initial_page",
      Rinu_ItemCategory: pathname.replace("/event/", ""),
    };
  }

  if (pathname === "/quote-request") {
    return {
      Rinu_ItemCategory: "enquire_request",
      Rinu_eLabel1: searchParams.get("venueID") ?? undefined,
      Rinu_eLabel2: searchParams.get("spaceID") ?? undefined,
    };
  }
};

const GoogleTagManagerWrapper = ({ gtmId }: { gtmId: string }) => {
  const [session] = useSession();
  const { cookies } = useCookies();
  const pathname = usePathname();

  useEffect(() => {
    if (!cookies || !cookies.analytics) {
      return;
    }

    if (session) {
      sendGTMEvent({
        user_id: session.user_id,
        session_id: sessionId,
      });
    } else if (session === null) {
      sendGTMEvent({
        user_id: null,
        session_id: sessionId,
      });
    }
  }, [cookies, session]);

  useEffect(() => {
    if (!cookies || !cookies.analytics) {
      return;
    }

    if (session === undefined) return;

    const params = getParamsForPathname(pathname);

    if (params) {
      sendGAEvent("event", "Rinu_ScreenView", {
        Rinu_ScreenName: pathname,
        ...params,
      });
    }
  }, [cookies, session, pathname]);

  if (!cookies || !cookies.analytics) {
    return null;
  }

  return <GoogleTagManager gtmId={gtmId} />;
};

export default GoogleTagManagerWrapper;
