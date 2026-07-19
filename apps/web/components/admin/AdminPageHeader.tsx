import Link from "next/link";
import type { ReactNode } from "react";

type Breadcrumb = {
  label: string;
  href?: string;
};

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  status?: ReactNode;
  updatedAt?: string;
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  primaryAction,
  secondaryActions,
  status,
  updatedAt,
}: Props) {
  return (
    <header className="admin-page-header">
      <div className="admin-page-header-copy">
        {breadcrumbs?.length ? (
          <nav className="admin-breadcrumbs" aria-label="مسار الصفحة">
            <ol>
              {breadcrumbs.map((item, index) => (
                <li key={`${item.label}-${index}`}>
                  {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        {eyebrow ? <span className="admin-page-eyebrow">{eyebrow}</span> : null}
        <div className="admin-page-title-row">
          <h1>{title}</h1>
          {status}
        </div>
        {description ? <p>{description}</p> : null}
        {updatedAt ? <small>آخر تحديث: {updatedAt}</small> : null}
      </div>
      {primaryAction || secondaryActions ? (
        <div className="admin-page-header-actions">
          {secondaryActions}
          {primaryAction}
        </div>
      ) : null}
    </header>
  );
}
