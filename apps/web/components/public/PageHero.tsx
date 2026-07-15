import type { ReactNode } from "react";

type Crumb = { href?: string; label: string };

type Props = {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  tone?: "white" | "mist" | "soft";
  actions?: ReactNode;
  media?: ReactNode;
};

export function PageHero({
  title,
  description,
  crumbs,
  tone = "mist",
  actions,
  media,
}: Props) {
  return (
    <section className={`pub-band pub-band-${tone} page-hero page-hero--premium`}>
      <div className={`pub-container${media ? " page-hero-split" : ""}`}>
        <div className="page-hero-copy">
          {crumbs?.length ? (
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <ol>
                {crumbs.map((c, i) => (
                  <li key={`${c.label}-${i}`}>
                    {c.href ? <a href={c.href}>{c.label}</a> : <span>{c.label}</span>}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <h1>{title}</h1>
          {description ? <p className="pub-lead">{description}</p> : null}
          {actions ? <div className="cta-row">{actions}</div> : null}
        </div>
        {media ? <div className="page-hero-media">{media}</div> : null}
      </div>
    </section>
  );
}
