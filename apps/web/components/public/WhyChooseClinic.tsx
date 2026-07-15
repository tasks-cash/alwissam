import type { PublicCopy } from "../../lib/i18n/public-copy";

const ICONS = [
  "M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2z",
  "M4 12h16M12 4v16",
  "M5 12a7 7 0 0 1 14 0v6H5v-6z",
  "M12 3v18M5 10h14",
  "M4 19h16M7 19V9l5-5 5 5v10",
  "M6 8h12v10H6zM9 8V6h6v2",
  "M4 7h16v2H4zm0 4h10v2H4zm0 4h16v2H4z",
  "M12 5v14M7 10l5-5 5 5",
];

type Props = {
  copy: PublicCopy;
};

export function WhyChooseClinic({ copy }: Props) {
  return (
    <div className="why-grid" role="list">
      {copy.whyItems.map((item, i) => (
        <article key={item.title} className="why-card" role="listitem">
          <span className="why-icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                d={ICONS[i % ICONS.length]}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
  );
}
