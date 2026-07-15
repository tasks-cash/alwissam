"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  useTransition,
} from "react";
import type { Locale } from "../../../lib/i18n/config";
import type { PublicFaq, PublicFaqCategory } from "../../../lib/public-site";

type FaqCopy = {
  searchPlaceholder: string;
  searchLabel: string;
  clearSearch: string;
  resultsCountTemplate: string; // use {n}
  featuredTitle: string;
  allCategories: string;
  emptyCategory: string;
  emptySearch: string;
  loadError: string;
  retry: string;
  book: string;
  doctors: string;
  services: string;
  specialties: string;
  contact: string;
  whatsapp: string;
  directions: string;
  sendInquiry: string;
  callClinic: string;
  supportTitle: string;
  supportDesc: string;
  disclaimer: string;
  relatedService: string;
  relatedSpecialty: string;
};

export function FaqExplorer({
  locale,
  initialFaqs,
  initialCategories,
  initialAllCount,
  initialFeatured,
  copy,
  phoneTel,
  whatsappHref,
  mapsHref,
}: {
  locale: Locale;
  initialFaqs: PublicFaq[];
  initialCategories: PublicFaqCategory[];
  initialAllCount: number;
  initialFeatured: PublicFaq[];
  copy: FaqCopy;
  phoneTel: string;
  whatsappHref: string;
  mapsHref: string;
}) {
  const baseId = useId();
  const [category, setCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [faqs, setFaqs] = useState(initialFaqs);
  const [categories, setCategories] = useState(initialCategories);
  const [allCount, setAllCount] = useState(initialAllCount);
  const [total, setTotal] = useState(initialFaqs.length);
  const [featured, setFeatured] = useState(initialFeatured);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const t = window.setTimeout(() => setSearch(searchInput.trim()), 320);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(
    async (opts: { category: string; search: string }) => {
      setError(false);
      try {
        const params = new URLSearchParams({
          locale,
          page: "1",
          limit: "200",
        });
        if (opts.category && opts.category !== "all") {
          params.set("category", opts.category);
        }
        if (opts.search) params.set("search", opts.search);
        const res = await fetch(`/api/public/faqs?${params}`, {
          credentials: "same-origin",
        });
        if (!res.ok) throw new Error("load failed");
        const data = await res.json();
        setFaqs(Array.isArray(data.faqs) ? data.faqs : []);
        setTotal(Number(data.total) || 0);
        setCategories(Array.isArray(data.categories) ? data.categories : []);
        setAllCount(Number(data.allCount) || 0);
      } catch {
        setError(true);
      }
    },
    [locale],
  );

  useEffect(() => {
    startTransition(() => {
      void load({ category, search });
    });
  }, [category, search, load]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({
          locale,
          featured: "true",
          limit: "12",
        });
        const res = await fetch(`/api/public/faqs?${params}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.faqs)) setFeatured(data.faqs);
      } catch {
        /* keep initial */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const grouped = useMemo(() => {
    const map = new Map<string, PublicFaq[]>();
    for (const faq of faqs) {
      const key = faq.category || "general";
      const list = map.get(key) || [];
      list.push(faq);
      map.set(key, list);
    }
    return map;
  }, [faqs]);

  const categoryLabel = (id: string) => {
    if (id === "all") return copy.allCategories;
    return categories.find((c) => c.id === id)?.label || id;
  };

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const showFeatured =
    !search && category === "all" && featured.length > 0;

  return (
    <div className="faq-explorer">
      <div className="faq-search-block">
        <label className="faq-search-label" htmlFor={`${baseId}-search`}>
          {copy.searchLabel}
        </label>
        <div className="faq-search-row">
          <input
            id={`${baseId}-search`}
            type="search"
            className="faq-search-input"
            placeholder={copy.searchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            autoComplete="off"
            dir={locale === "ar" ? "rtl" : "ltr"}
          />
          {searchInput ? (
            <button
              type="button"
              className="btn btn-outline faq-clear-btn"
              onClick={() => setSearchInput("")}
            >
              {copy.clearSearch}
            </button>
          ) : null}
        </div>
        <p className="faq-results-count" aria-live="polite">
          {pending
            ? "…"
            : copy.resultsCountTemplate.replace(
                "{n}",
                String(error ? 0 : total),
              )}
        </p>
      </div>

      <div
        className="faq-category-nav"
        role="tablist"
        aria-label={copy.allCategories}
      >
        <button
          type="button"
          role="tab"
          aria-selected={category === "all"}
          className={`faq-cat-chip${category === "all" ? " is-active" : ""}`}
          onClick={() => setCategory("all")}
        >
          {copy.allCategories}
          <span className="faq-cat-count">{allCount}</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={category === cat.id}
            className={`faq-cat-chip${category === cat.id ? " is-active" : ""}`}
            onClick={() => setCategory(cat.id)}
          >
            {cat.label}
            <span className="faq-cat-count">{cat.count}</span>
          </button>
        ))}
      </div>

      {error ? (
        <div className="faq-state card-surface" role="alert">
          <p>{copy.loadError}</p>
          <div className="faq-state-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void load({ category, search })}
            >
              {copy.retry}
            </button>
            {whatsappHref ? (
              <a className="btn btn-outline" href={whatsappHref}>
                {copy.whatsapp}
              </a>
            ) : null}
            <Link className="btn btn-outline" href={`/${locale}/contact`}>
              {copy.contact}
            </Link>
          </div>
        </div>
      ) : null}

      {!error && showFeatured ? (
        <section className="faq-featured" aria-labelledby={`${baseId}-featured`}>
          <h2 id={`${baseId}-featured`}>{copy.featuredTitle}</h2>
          <FaqList
            locale={locale}
            faqs={featured}
            openIds={openIds}
            onToggle={toggle}
            baseId={`${baseId}-feat`}
            copy={copy}
            idPrefix="featured"
          />
        </section>
      ) : null}

      {!error && faqs.length === 0 ? (
        <div className="faq-state card-surface">
          <p>{search ? copy.emptySearch : copy.emptyCategory}</p>
          <div className="faq-state-actions">
            {whatsappHref ? (
              <a className="btn btn-primary" href={whatsappHref}>
                {copy.whatsapp}
              </a>
            ) : null}
            <Link className="btn btn-outline" href={`/${locale}/contact`}>
              {copy.sendInquiry}
            </Link>
            <Link className="btn btn-outline" href={`/${locale}/book`}>
              {copy.book}
            </Link>
          </div>
        </div>
      ) : null}

      {!error && faqs.length > 0 ? (
        <div className="faq-groups">
          {category === "all" && !search
            ? [...grouped.entries()].map(([catId, list]) => (
                <section
                  key={catId}
                  className="faq-group"
                  aria-labelledby={`${baseId}-cat-${catId}`}
                >
                  <h2 id={`${baseId}-cat-${catId}`}>
                    {categoryLabel(catId)}
                  </h2>
                  <FaqList
                    locale={locale}
                    faqs={list}
                    openIds={openIds}
                    onToggle={toggle}
                    baseId={`${baseId}-${catId}`}
                    copy={copy}
                    idPrefix={catId}
                  />
                </section>
              ))
            : (
              <FaqList
                locale={locale}
                faqs={faqs}
                openIds={openIds}
                onToggle={toggle}
                baseId={`${baseId}-list`}
                copy={copy}
                idPrefix="list"
              />
            )}
        </div>
      ) : null}

      <section className="faq-support card-surface" aria-labelledby={`${baseId}-support`}>
        <h2 id={`${baseId}-support`}>{copy.supportTitle}</h2>
        <p>{copy.supportDesc}</p>
        <div className="faq-support-actions">
          <Link className="btn btn-primary" href={`/${locale}/contact`}>
            {copy.sendInquiry}
          </Link>
          {whatsappHref ? (
            <a className="btn btn-outline" href={whatsappHref}>
              {copy.whatsapp}
            </a>
          ) : null}
          {phoneTel ? (
            <a className="btn btn-outline" href={phoneTel} dir="ltr">
              {copy.callClinic}
            </a>
          ) : null}
          <Link className="btn btn-outline" href={`/${locale}/book`}>
            {copy.book}
          </Link>
        </div>
        <div className="faq-quick-links">
          <Link href={`/${locale}/doctors`}>{copy.doctors}</Link>
          <Link href={`/${locale}/services`}>{copy.services}</Link>
          <Link href={`/${locale}/specialties`}>{copy.specialties}</Link>
          {mapsHref ? (
            <a href={mapsHref} target="_blank" rel="noopener noreferrer">
              {copy.directions}
            </a>
          ) : null}
        </div>
      </section>

      <p className="faq-disclaimer">{copy.disclaimer}</p>
    </div>
  );
}

function FaqList({
  locale,
  faqs,
  openIds,
  onToggle,
  baseId,
  copy,
  idPrefix,
}: {
  locale: Locale;
  faqs: PublicFaq[];
  openIds: Set<string>;
  onToggle: (id: string) => void;
  baseId: string;
  copy: FaqCopy;
  idPrefix: string;
}) {
  return (
    <div className="faq-list">
      {faqs.map((faq, i) => {
        const key = faq.id || faq.slug || `${idPrefix}-${i}`;
        const panelId = `${baseId}-panel-${key}`;
        const btnId = `${baseId}-btn-${key}`;
        const expanded = openIds.has(key);
        const question = faq.question || "";
        const answer = faq.answer || "";
        return (
          <article
            key={key}
            className="faq-item"
            id={faq.slug ? `faq-${faq.slug}` : undefined}
          >
            <h3>
              <button
                type="button"
                className="faq-trigger"
                id={btnId}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => onToggle(key)}
              >
                <span>{question}</span>
                <span className="faq-chevron" aria-hidden>
                  {expanded ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!expanded}
              className="faq-panel"
            >
              <p>{answer}</p>
              <div className="faq-related">
                {(faq.relatedServiceSlugs || []).slice(0, 2).map((slug) => (
                  <Link
                    key={slug}
                    href={`/${locale}/services/${encodeURIComponent(slug)}`}
                  >
                    {copy.relatedService}
                  </Link>
                ))}
                {(faq.relatedSpecialtySlugs || []).slice(0, 2).map((slug) => (
                  <Link
                    key={slug}
                    href={`/${locale}/specialties/${encodeURIComponent(slug)}`}
                  >
                    {copy.relatedSpecialty}
                  </Link>
                ))}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
