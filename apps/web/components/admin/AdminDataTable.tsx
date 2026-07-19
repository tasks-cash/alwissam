import type { ReactNode } from "react";

export function AdminTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "بحث...",
  filters,
  actions,
  resultCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  resultCount?: number;
}) {
  return (
    <div className="admin-table-toolbar">
      <label className="admin-search">
        <span className="sr-only">بحث</span>
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          value={search}
          placeholder={searchPlaceholder}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      <div className="admin-table-filters">{filters}</div>
      {typeof resultCount === "number" ? (
        <span className="admin-results-count">{resultCount} نتيجة</span>
      ) : null}
      {actions}
    </div>
  );
}

export function AdminPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="admin-pagination" aria-label="صفحات النتائج">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        السابق
      </button>
      <span>
        الصفحة {page} من {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        التالي
      </button>
    </nav>
  );
}

export function AdminRowActions({ children }: { children: ReactNode }) {
  return (
    <details className="admin-row-actions">
      <summary aria-label="المزيد من الإجراءات">•••</summary>
      <div role="menu">{children}</div>
    </details>
  );
}
