import type { ReactNode } from "react";

/** Isolates LTR values (phone, email, postal, times, URLs) inside RTL pages. */
export function BidiSafeValue({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span dir="ltr" className={className}>
      {children}
    </span>
  );
}
