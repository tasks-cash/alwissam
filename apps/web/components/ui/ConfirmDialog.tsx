"use client";

import { FormEvent, useRef } from "react";
import { AdminDialog } from "../admin/AdminDialog";

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
  const confirmRef = useRef<HTMLButtonElement>(null);

  return (
    <AdminDialog
      open={open}
      title={title}
      description={description}
      onClose={onCancel}
      busy={loading}
      size="sm"
      initialFocusRef={confirmRef}
      footer={
        <div className="admin-dialog-actions">
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
            form="admin-confirm-form"
            className="btn admin-btn-danger"
            disabled={loading}
          >
            {loading ? "جارٍ التنفيذ..." : confirmLabel}
          </button>
        </div>
      }
    >
      <form
        id="admin-confirm-form"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          if (!loading) onConfirm();
        }}
      >
        {error ? <div className="alert-error">{error}</div> : null}
      </form>
    </AdminDialog>
  );
}
