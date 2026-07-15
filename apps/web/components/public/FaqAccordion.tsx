"use client";

import { useId, useState } from "react";
import type { Locale } from "../../lib/i18n/config";
import {
  localizedFaqA,
  localizedFaqQ,
  type PublicFaq,
} from "../../lib/public-site";

export function FaqAccordion({
  locale,
  faqs,
}: {
  locale: Locale;
  faqs: PublicFaq[];
}) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="faq-list">
      {faqs.map((f, i) => {
        const q = localizedFaqQ(locale, f);
        const a = localizedFaqA(locale, f);
        const expanded = open === i;
        return (
          <div key={`${q}-${i}`} className="faq-item card-surface">
            <h3>
              <button
                type="button"
                className="faq-trigger"
                aria-expanded={expanded}
                aria-controls={`${baseId}-${i}`}
                id={`${baseId}-btn-${i}`}
                onClick={() => setOpen(expanded ? null : i)}
              >
                {q}
              </button>
            </h3>
            <div
              id={`${baseId}-${i}`}
              role="region"
              aria-labelledby={`${baseId}-btn-${i}`}
              hidden={!expanded}
              className="faq-panel"
            >
              <p>{a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
