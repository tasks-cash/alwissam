"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import type { PublicSpecialty } from "../../lib/public-site";
import {
  localizedSpecialtyDesc,
  localizedSpecialtyName,
} from "../../lib/public-site";
import { SpecialtyCard } from "./SpecialtyCard";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  specialties: PublicSpecialty[];
  initialQuery?: string;
};

function matchesQuery(specialty: PublicSpecialty, locale: Locale, q: string) {
  if (!q) return true;
  const blob = [
    localizedSpecialtyName(locale, specialty),
    localizedSpecialtyDesc(locale, specialty),
    specialty.slug,
    specialty.nameAr,
    specialty.nameEn,
    specialty.nameFr,
    ...(specialty.servicePreviews || []).map((p) => p.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return blob.includes(q);
}

export function SpecialtiesExplorer({
  locale,
  copy,
  specialties,
  initialQuery = "",
}: Props) {
  const [rawQuery, setRawQuery] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery.trim().toLowerCase());

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setQuery(rawQuery.trim().toLowerCase());
    }, 250);
    return () => window.clearTimeout(handle);
  }, [rawQuery]);

  const filtered = useMemo(
    () => specialties.filter((s) => matchesQuery(s, locale, query)),
    [specialties, locale, query],
  );

  const featured = filtered.filter((s) => s.isFeatured);
  const rest = filtered.filter((s) => !s.isFeatured);
  const grid = featured.length ? [...featured, ...rest] : filtered;

  return (
    <div className="specialties-explorer">
      <form
        className="catalog-search specialties-search"
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="sr-only" htmlFor="specialties-q">
          {copy.searchSpecialtyService}
        </label>
        <input
          id="specialties-q"
          className="input"
          value={rawQuery}
          onChange={(e) => setRawQuery(e.target.value)}
          placeholder={copy.searchSpecialtyService}
          dir={locale === "ar" ? "rtl" : "ltr"}
          autoComplete="off"
        />
        {rawQuery ? (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setRawQuery("");
              setQuery("");
            }}
          >
            {locale === "en" ? "Clear" : locale === "fr" ? "Effacer" : "مسح"}
          </button>
        ) : null}
      </form>

      <p className="specialties-result-count muted" aria-live="polite">
        {filtered.length}{" "}
        {locale === "en"
          ? "results"
          : locale === "fr"
            ? "résultats"
            : "نتيجة"}
      </p>

      {grid.length === 0 ? (
        <div className="empty-state card-surface">
          <p>{copy.emptySpecialties}</p>
        </div>
      ) : (
        <>
          {featured.length > 0 && !query ? (
            <div className="specialties-featured-block">
              <h2 className="specialties-block-title">{copy.featuredSpecialtiesTitle}</h2>
              <div className="specialty-card-grid" id="specialty-grid">
                {featured.map((s, i) => (
                  <SpecialtyCard
                    key={s.slug}
                    locale={locale}
                    copy={copy}
                    specialty={s}
                    index={i}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="specialties-all-block">
            {(featured.length === 0 || query) && (
              <h2 className="specialties-block-title" id={featured.length ? undefined : "specialty-grid"}>
                {copy.allSpecialtiesTitle}
              </h2>
            )}
            {featured.length > 0 && !query ? (
              <h2 className="specialties-block-title">{copy.allSpecialtiesTitle}</h2>
            ) : null}
            <div
              className="specialty-card-grid"
              id={featured.length && !query ? undefined : "specialty-grid"}
            >
              {(featured.length && !query ? rest : grid).map((s, i) => (
                <SpecialtyCard
                  key={s.slug}
                  locale={locale}
                  copy={copy}
                  specialty={s}
                  index={i}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
