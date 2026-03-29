"use client";

import { useEffect, useRef } from "react";

// Google Translate language codes
const LANG_MAP: Record<string, string> = {
  en: "en",
  gu: "gu",
  hi: "hi",
  mr: "mr",
  ta: "ta",
  te: "te",
  bn: "bn",
  pa: "pa",
  kn: "kn",
  ml: "ml",
};

declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages?: string;
            autoDisplay?: boolean;
          },
          elementId: string
        ) => void;
      };
    };
    googleTranslateElementInit: () => void;
  }
}

// Trigger Google Translate to switch to a specific language
export function triggerGoogleTranslate(langCode: string) {
  const gtCode = LANG_MAP[langCode] ?? langCode;

  if (gtCode === "en") {
    // Restore original — find the "Show original" link Google injects
    const restore = document.querySelector<HTMLElement>(
      ".goog-te-banner-frame"
    );
    if (restore) {
      const iframe = restore as HTMLIFrameElement;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      const btn = doc?.querySelector<HTMLElement>(".goog-te-banner-content button");
      btn?.click();
    }
    // Also try cookie approach
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
    window.location.reload();
    return;
  }

  // Set the googtrans cookie that Google Translate reads
  const value = `/en/${gtCode}`;
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;

  // Try to use the select element Google injects
  const select = document.querySelector<HTMLSelectElement>(
    ".goog-te-combo"
  );
  if (select) {
    select.value = gtCode;
    select.dispatchEvent(new Event("change"));
    return;
  }

  // Fallback: reload — Google Translate will pick up the cookie
  window.location.reload();
}

// Hidden div that Google Translate widget mounts into
export function GoogleTranslateInit() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Add Google Translate script
    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.head.appendChild(script);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,gu,hi,mr,ta,te,bn,pa,kn,ml",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };
  }, []);

  return (
    <div
      id="google_translate_element"
      style={{ display: "none", position: "absolute" }}
      aria-hidden="true"
    />
  );
}
