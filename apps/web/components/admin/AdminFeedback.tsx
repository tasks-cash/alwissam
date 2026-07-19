"use client";

import { useEffect, type ReactNode } from "react";

export type AdminToastState = {
  type: "success" | "error" | "info";
  message: string;
  actionLabel?: string;
  onAction?: () => void;
} | null;

export function AdminToast({
  toast,
  onDismiss,
}: {
  toast: AdminToastState;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, toast.type === "error" ? 7000 : 4500);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast]);

  if (!toast) return null;
  return (
    <div
      className={`admin-toast admin-toast--${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
    >
      <span>{toast.message}</span>
      {toast.actionLabel && toast.onAction ? (
        <button type="button" onClick={toast.onAction}>
          {toast.actionLabel}
        </button>
      ) : null}
      <button type="button" aria-label="إغلاق التنبيه" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}

export function AdminLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="admin-skeleton" aria-label="جارٍ تحميل البيانات" aria-busy="true">
      {Array.from({ length: rows }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-empty-state">
      <span aria-hidden="true">◇</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function AdminErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="admin-error-state" role="alert">
      <div>
        <strong>تعذر إكمال الطلب</strong>
        <p>{message}</p>
      </div>
      {onRetry ? (
        <button type="button" className="btn btn-outline" onClick={onRetry}>
          إعادة المحاولة
        </button>
      ) : null}
    </div>
  );
}

export function AdminStatusBadge({
  tone = "neutral",
  children,
}: {
  tone?: "success" | "warning" | "error" | "info" | "neutral";
  children: ReactNode;
}) {
  return <span className={`admin-status admin-status--${tone}`}>{children}</span>;
}
