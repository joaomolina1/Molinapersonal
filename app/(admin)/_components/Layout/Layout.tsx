"use client";

import { createBEMClasses } from "@/_utils/classname";
import { useSession } from "@/_services/session";
import { useLocalStorage } from "@/_services/localStorage";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";

const { block, element } = createBEMClasses("admin-shell");

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [session] = useSession();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const collapsedStorage = useLocalStorage<boolean>("admin-sidebar-collapsed");
  const isCollapsed = collapsedStorage.value === true;

  useEffect(() => {
    if (session === null || (!!session && !session.roles.includes("admin"))) {
      router.replace("/");
    }
  }, [router, session]);

  if (!session || !session.roles.includes("admin")) {
    return null;
  }

  return (
    <div className={block()}>
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isCollapsed}
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
        <Topbar onMenuToggle={() => setIsSidebarOpen((open) => !open)} />
        <main className={element("content")}>{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
