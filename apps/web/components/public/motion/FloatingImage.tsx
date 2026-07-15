"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Soft continuous float; disabled when reduced motion. */
  amplitude?: number;
};

/**
 * Subtle floating wrapper for hero media. Respects prefers-reduced-motion.
 */
export function FloatingImage({
  children,
  className = "",
  amplitude = 6,
}: Props) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const style = {
    ["--float-amp" as string]: `${amplitude}px`,
  } as CSSProperties;

  return (
    <div
      className={[
        "floating-image",
        reduced ? "floating-image--static" : "floating-image--motion",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}
