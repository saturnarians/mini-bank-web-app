"use client"

import { useEffect } from "react";

export default function ChatwootWidget() {
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL?.trim() || "https://app.chatwoot.com";
    const websiteToken = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN?.trim();

    if (!websiteToken) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Chatwoot disabled: NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN is missing.");
      }
      return;
    }

    window.chatwootSettings = {
      hideMessageBubble: false,
      position: "right",
      locale: "en",
    };

    if (window.chatwootSDK) {
      window.chatwootSDK.run({ websiteToken, baseUrl });
      return;
    }

    if (window.__chatwootScriptLoaded) return;
    window.__chatwootScriptLoaded = true;

    const script = document.createElement("script");
    script.src = `${baseUrl}/packs/js/sdk.js`;
    script.async = true;

    script.onload = () => {
      window.chatwootSDK?.run({
        websiteToken,
        baseUrl,
      });
    };

    document.body.appendChild(script);
  }, []);

  return null; // This component doesn't render any UI itself
}
