"use client";

import Script from "next/script";
import config from "@/_utils/config";

// Default to the RINU production agent; overridable via env.
const DEFAULT_AGENT_ID = "agent_6401kjxnyjtcenhamgw4wg0k4k07";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { "agent-id"?: string; variant?: string };
    }
  }
}

export const ElevenLabsWidget = () => {
  const agentId = config.elevenLabsAgentId || DEFAULT_AGENT_ID;

  if (!agentId) {
    return null;
  }

  return (
    <>
      <elevenlabs-convai agent-id={agentId} variant="tiny" />
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
        async
      />
    </>
  );
};

export default ElevenLabsWidget;
