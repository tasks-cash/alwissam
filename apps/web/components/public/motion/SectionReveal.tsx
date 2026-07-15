"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Logical slide direction for LTR; RTL mirrors via CSS logical properties. */
  from?: "up" | "start" | "end";
  delayMs?: number;
};

/**
 * Intersection-based section reveal. Content remains visible without JS /
 * when prefers-reduced-motion is on (via CSS .home-reveal--reduced).
 */
export function SectionReveal({
  children,
  className = "",
  from = "up",
  delayMs = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={[
        "home-reveal",
        `home-reveal--${from}`,
        visible || reduced ? "home-reveal--in" : "",
        reduced ? "home-reveal--reduced" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={delayMs && !reduced ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
