"use client";

import { FormEvent, useEffect, useId, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "إلغاء",
  loading,
  error,
  onCancel,
  onConfirm,
}: Props) {
  const titleId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,39,71,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
        padding: "1rem",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <form
        className="card-surface"
        style={{ width: "100%", maxWidth: 420, padding: "1.25rem", display: "grid", gap: "0.85rem" }}
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          if (!loading) onConfirm();
        }}
      >
        <h2 id={titleId} style={{ margin: 0, color: "var(--primary-navy)" }}>
          {title}
        </h2>
        <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          {description}
        </p>
        {error ? <div className="alert-error">{error}</div> : null}
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "جارٍ التنفيذ..." : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
