"use client";

import { useCookies } from "@/_services/cookies";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";

const MetaPixel = ({ metaPixelId }: { metaPixelId: string }) => {
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();
  const { cookies } = useCookies();

  useEffect(() => {
    if (!loaded) return;

    if (!cookies || !cookies.analytics) return;

    window.fbq("track", "PageView");
  }, [pathname, loaded, cookies]);

  if (!cookies || !cookies.analytics) {
    return null;
  }

  return (
    <div>
      <Script
        id="meta-pixel"
        src="/scripts/meta-pixel.js"
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
        data-pixel-id={metaPixelId}
      />
    </div>
  );
};

export default MetaPixel;
