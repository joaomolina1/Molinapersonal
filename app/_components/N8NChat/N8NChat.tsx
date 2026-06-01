"use client";

import { useSession } from "@/_services/session";
import { createChat } from "@n8n/chat";
import { useEffect } from "react";

import "@n8n/chat/style.css";
import config from "@/_utils/config";

export const N8NChat = () => {
  const [session] = useSession();

  if (!session?.roles.includes("admin")) {
    return null;
  }

  return <N8NChatWidget />;
};

const N8NChatWidget = () => {
  useEffect(() => {
    createChat({
      mode: "window",
      webhookUrl: config.n8nWebhookUrl,
      loadPreviousSession: false,
      allowFileUploads: true,
      i18n: {
        en: {
          inputPlaceholder: "Rinu_ID",
          subtitle: "⚡ AI-Powered RINU Workflow",
          title: "🤖 GENINU",
          footer: "",
          getStarted: "",
          closeButtonTooltip: "",
        },
      },
      initialMessages: [
        "Olá! 👋 - Adiciona um rinu_id para começar o workflow 🚀",
      ],
      enableStreaming: false,
      target: "#n8n-chat",
    });
  });

  return <div id="n8n-chat"></div>;
};
