import type { PublicCopy } from "../../lib/i18n/public-copy";

type Props = {
  copy: PublicCopy;
  hours: string;
};

/** Renders multiline clinic hours with LTR isolation for clocks. */
export function WorkingHours({ copy, hours }: Props) {
  if (!hours?.trim()) return null;
  const lines = hours.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  return (
    <div className="working-hours">
      <h3>{copy.hoursLabel}</h3>
      <ul className="working-hours-list">
        {lines.map((line) => (
          <li key={line}>
            <span dir="auto">{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
