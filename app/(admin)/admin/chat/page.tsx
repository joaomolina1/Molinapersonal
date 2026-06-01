"use client";

import { useChatKit, ChatKit } from "@openai/chatkit-react";
import TextBlock from "@/_design_system/TextBlock";
import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";
import Script from "next/script";
import { useState } from "react";
import { useGetChatKitSession } from "@/_models/conversation";

const { element } = createBEMClasses("admin-chat");

export default function AdminChat() {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const { mutateAsync: getChatKitSession } = useGetChatKitSession();

  const { control } = useChatKit({
    api: {
      async getClientSecret(currentClientSecret: string | null) {
        const { client_secret } = await getChatKitSession(
          currentClientSecret ? { currentClientSecret } : undefined,
        );

        return client_secret;
      },
    },
    theme: {
      colorScheme: "light",
      radius: "pill",
      density: "spacious",
      typography: {
        baseSize: 16,
        fontFamily:
          '"OpenAI Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
        fontFamilyMono:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
        fontSources: [
          {
            family: "OpenAI Sans",
            src: "https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-Regular.woff2",
            weight: 400,
            style: "normal",
            display: "swap",
          },
        ],
      },
    },
    composer: {
      placeholder: "Então? Temos aí algum deal para trabalhar?",
      attachments: {
        enabled: true,
        maxCount: 5,
        maxSize: 10485760,
      },
    },
    disclaimer: {
      text: "Não trato deals abaixo de 1000 pau",
    },
    startScreen: {
      greeting: "GENINU",
      prompts: [],
    },
  });

  return (
    <>
      <Script
        src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
        onLoad={() => {
          console.log("ChatKit script loaded successfully");
          setIsScriptLoaded(true);
        }}
        onError={(e) => {
          console.error("Error loading ChatKit script:", e);
        }}
        strategy="afterInteractive"
      />
      <div>
        <TextBlock
          title="GENINU"
          // subtitle="Chat with the system using ChatKit"
        />

        <Stack gap="large" className={element("chat-container")}>
          <div className={element("chatkit-wrapper")}>
            {isScriptLoaded ? (
              <ChatKit control={control} className="h-[600px] w-[320px]" />
            ) : (
              <div>GENINU a pensar...</div>
            )}
          </div>
        </Stack>
      </div>
    </>
  );
}
