"use client";

import config from "@/_utils/config";
import posthog from "posthog-js";
import { PostHogProvider as _PostHogProvider } from "posthog-js/react";

import { PropsWithChildren, useEffect } from "react";

export const PostHogProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    if (config.posthogKey) {
      posthog.init(config.posthogKey, {
        api_host: config.posthogHost,
        defaults: "2025-05-24",
      });
    }
  }, []);

  return <_PostHogProvider client={posthog}>{children}</_PostHogProvider>;
};
