"use client";

import { useEffect } from "react";

/** Inject FAQPage JSON-LD client-side to avoid SSR Flight/HTML parse conflicts. */
export function FaqJsonLd({ json }: { json: string }) {
  useEffect(() => {
    if (!json) return;
    const existing = document.getElementById("faq-json-ld");
    if (existing) existing.remove();
    const el = document.createElement("script");
    el.id = "faq-json-ld";
    el.type = "application/ld+json";
    el.text = json;
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }, [json]);

  return null;
}
