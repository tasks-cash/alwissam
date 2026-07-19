"use client";

import {
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type AdminDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  dirty?: boolean;
  busy?: boolean;
  variant?: "dialog" | "drawer";
  size?: "sm" | "md" | "lg" | "xl";
  locale?: "ar" | "en" | "fr";
  initialFocusRef?: RefObject<HTMLElement | null>;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function AdminDialog({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  dirty = false,
  busy = false,
  variant = "dialog",
  size = "lg",
  locale = "ar",
  initialFocusRef,
}: AdminDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const discardTitleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const dirtyRef = useRef(dirty);
  const busyRef = useRef(busy);
  const [mounted, setMounted] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  onCloseRef.current = onClose;
  dirtyRef.current = dirty;
  busyRef.current = busy;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      const target =
        initialFocusRef?.current ||
        panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus();
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (busyRef.current) return;
        if (dirtyRef.current) setConfirmDiscard(true);
        else onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
      setConfirmDiscard(false);
    };
  }, [initialFocusRef, open]);

  if (!mounted || !open) return null;

  const requestClose = () => {
    if (busy) return;
    if (dirty) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  };

  return createPortal(
    <div
      className="admin-dialog-backdrop"
      data-variant={variant}
      dir={locale === "ar" ? "rtl" : "ltr"}
      lang={locale}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        ref={panelRef}
        className={`admin-dialog-panel admin-dialog-panel--${variant} admin-dialog-panel--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <header className="admin-dialog-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description ? <p id={descriptionId}>{description}</p> : null}
          </div>
          <button
            type="button"
            className="admin-dialog-close"
            aria-label={locale === "ar" ? "إغلاق" : "Close"}
            disabled={busy}
            onClick={requestClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="admin-dialog-body">{children}</div>
        {footer ? <footer className="admin-dialog-footer">{footer}</footer> : null}

        {confirmDiscard ? (
          <div
            className="admin-discard-layer"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={discardTitleId}
          >
            <div className="admin-discard-card">
              <h3 id={discardTitleId}>تغييرات غير محفوظة</h3>
              <p>هل تريد مغادرة النموذج وفقدان التغييرات التي لم تُحفظ؟</p>
              <div className="admin-dialog-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setConfirmDiscard(false)}
                >
                  متابعة التعديل
                </button>
                <button
                  type="button"
                  className="btn admin-btn-danger"
                  onClick={() => {
                    setConfirmDiscard(false);
                    onClose();
                  }}
                >
                  تجاهل التغييرات
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
