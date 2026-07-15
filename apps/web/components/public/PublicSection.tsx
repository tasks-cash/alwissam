import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  tone?: "white" | "mist" | "soft" | "green";
  id?: string;
};

/** Full-bleed public section with constrained inner container. */
export function PublicSection({
  children,
  className = "",
  tone = "white",
  id,
}: Props) {
  return (
    <section
      id={id}
      className={`pub-band pub-band-${tone} ${className}`.trim()}
    >
      <div className="pub-container">{children}</div>
    </section>
  );
}
