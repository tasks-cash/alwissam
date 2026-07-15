"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "span" | "div" | "p" | "strong" | "a";
  href?: string;
};

/**
 * Isolates LTR values (phone, email, codes, URLs) inside RTL pages
 * without forcing the surrounding Arabic label/layout to LTR.
 */
export function LtrValue({
  children,
  className,
  as: Tag = "span",
  href,
}: Props) {
  if (Tag === "a" && href) {
    return (
      <a href={href} className={className} dir="ltr">
        {children}
      </a>
    );
  }
  return (
    <Tag className={className} dir="ltr">
      {children}
    </Tag>
  );
}
