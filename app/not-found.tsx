"use client";

import { useRouterReplace } from "@/_services/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

export default function NotFoundSpace() {
  return (
    <Suspense fallback={null}>
      <HandleNotFound />
    </Suspense>
  );
}

const HandleNotFound = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routerReplace = useRouterReplace();

  useEffect(() => {
    if (pathname.startsWith("/space")) {
      const spaceID = pathname.replace("/space/", "");
      const params = new URLSearchParams(searchParams);
      params.set("spaceID", spaceID);
      routerReplace(`/space?${params.toString()}`);
    } else {
      routerReplace("/");
    }
  }, [pathname, routerReplace, searchParams]);

  return null;
};
