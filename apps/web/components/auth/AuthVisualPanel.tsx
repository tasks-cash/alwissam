import Image from "next/image";

type Props = {
  imageSrc: string;
  imageAlt: string;
  overlayTitle: string;
  benefitsTitle: string;
  benefits: string[];
  securityNote?: string;
  priority?: boolean;
};

/**
 * Premium presentation panel for unified auth pages.
 * Visual only — no authentication logic.
 */
export function AuthVisualPanel({
  imageSrc,
  imageAlt,
  overlayTitle,
  benefitsTitle,
  benefits,
  securityNote,
  priority = false,
}: Props) {
  return (
    <aside className="patient-auth-visual" aria-label={benefitsTitle}>
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        sizes="(max-width: 900px) 100vw, 48vw"
        priority={priority}
        className="patient-auth-image"
      />
      <div className="patient-auth-visual-copy">
        <p className="patient-auth-overlay-title">{overlayTitle}</p>
        <h2>{benefitsTitle}</h2>
        <ul className="patient-auth-benefits">
          {benefits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {securityNote ? (
          <p className="patient-auth-security-note">{securityNote}</p>
        ) : null}
      </div>
    </aside>
  );
}
