"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "../../lib/i18n/config";

type Props = {
  locale: Locale;
  placeholder: string;
  basePath: string;
  initialQuery?: string;
  specialtyOptions?: Array<{ slug: string; label: string }>;
  initialSpecialty?: string;
};

export function CatalogSearch({
  locale,
  placeholder,
  basePath,
  initialQuery = "",
  specialtyOptions,
  initialSpecialty = "",
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [specialty, setSpecialty] = useState(initialSpecialty);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (specialty) params.set("specialty", specialty);
    const qs = params.toString();
    router.push(`${basePath}${qs ? `?${qs}` : ""}`);
  }

  function clearFilters() {
    setQ("");
    setSpecialty("");
    router.push(basePath);
  }

  return (
    <form className="catalog-search" onSubmit={onSubmit} role="search">
      <label className="sr-only" htmlFor="catalog-q">
        {placeholder}
      </label>
      <input
        id="catalog-q"
        className="input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        dir={locale === "ar" ? "rtl" : "ltr"}
      />
      {specialtyOptions ? (
        <>
          <label className="sr-only" htmlFor="catalog-specialty">
            specialty
          </label>
          <select
            id="catalog-specialty"
            className="input"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            <option value="">
              {locale === "en"
                ? "All specialties"
                : locale === "fr"
                  ? "Toutes les spécialités"
                  : "كل التخصصات"}
            </option>
            {specialtyOptions.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </>
      ) : null}
      <button type="submit" className="btn btn-primary">
        {locale === "en" ? "Search" : locale === "fr" ? "Rechercher" : "بحث"}
      </button>
      {q || specialty ? (
        <button type="button" className="btn btn-outline" onClick={clearFilters}>
          {locale === "en" ? "Clear" : locale === "fr" ? "Effacer" : "مسح"}
        </button>
      ) : null}
    </form>
  );
}
