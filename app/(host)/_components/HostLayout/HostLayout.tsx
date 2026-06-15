"use client";

import { createBEMClasses } from "@/_utils/classname";
import { useSession } from "@/_services/session";
import { useLocalStorage } from "@/_services/localStorage";
import { useRouter } from "next/navigation";
import { useAllSpaces } from "@/_models/space";
import { useVenues } from "@/_models/venue";
import { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";

const { block, element } = createBEMClasses("host-shell");

const HostLayout = ({ children }: { children: React.ReactNode }) => {
  const [session] = useSession();
  const router = useRouter();

  const { data: venues, isPending: isPendingVenues } = useVenues({
    enabled: !!session,
  });
  const { data: spaces, isPending: isPendingSpaces } = useAllSpaces();

  const hasHostContent = (venues?.length ?? 0) > 0 || (spaces?.length ?? 0) > 0;
  const hasPaidTier = (venues ?? []).some(
    (venue) =>
      venue.subscription === "premium" || venue.subscription === "expert",
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const collapsedStorage = useLocalStorage<boolean>("host-sidebar-collapsed");
  const isCollapsed = collapsedStorage.value === true;

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
    <div className={block()}>
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isCollapsed}
        hasPaidTier={hasPaidTier}
        onToggleCollapsed={() => collapsedStorage.setValue(!isCollapsed)}
        onNavigate={() => setIsSidebarOpen(false)}
      />
      {isSidebarOpen && (
        <button
          type="button"
          className={element("backdrop")}
          aria-label="Fechar menu"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className={element("main")}>
        <Topbar
          hasPaidTier={hasPaidTier}
          onMenuToggle={() => setIsSidebarOpen((open) => !open)}
        />
        <main className={element("content")}>{children}</main>
      </div>
    </div>
  );
};

export default HostLayout;
