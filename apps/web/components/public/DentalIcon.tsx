type Props = {
  name: string;
  size?: number;
  className?: string;
};

/** Distinct professional dental icons by catalog icon key — SVG only. */
export function DentalIcon({ name, size = 28, className }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "whitening":
    case "sparkle":
      return (
        <svg {...common}>
          <path d="M12 3c2.5 3 4 6.2 4 9.2A4 4 0 0 1 8 12.2C8 9.2 9.5 6 12 3Z" />
          <path d="M18 5l.6 1.4L20 7l-1.4.6L18 9l-.6-1.4L16 7l1.4-.6L18 5Z" />
        </svg>
      );
    case "scaling":
    case "gums":
      return (
        <svg {...common}>
          <path d="M7 14c1.2 2.4 2.8 3.5 5 3.5s3.8-1.1 5-3.5" />
          <path d="M8 8c.8-2 2-3.5 4-3.5s3.2 1.5 4 3.5" />
          <path d="M5 12h14" />
        </svg>
      );
    case "braces":
    case "aligner":
      return (
        <svg {...common}>
          <path d="M6 10h12M6 14h12" />
          <rect x="7" y="8" width="2.2" height="8" rx="0.6" />
          <rect x="11" y="8" width="2.2" height="8" rx="0.6" />
          <rect x="15" y="8" width="2.2" height="8" rx="0.6" />
        </svg>
      );
    case "root":
      return (
        <svg {...common}>
          <path d="M12 3c2.2 2.6 3.4 5.2 3.4 7.6 0 1.6-.7 2.8-1.8 4.2L12 21l-1.6-6.2C9.3 13.4 8.6 12.2 8.6 10.6 8.6 8.2 9.8 5.6 12 3Z" />
          <path d="M12 9v5" />
        </svg>
      );
    case "implant":
      return (
        <svg {...common}>
          <path d="M12 3v7" />
          <path d="M9 7h6" />
          <path d="M10 10h4v4l-2 7-2-7v-4Z" />
        </svg>
      );
    case "crown":
    case "bridge":
    case "denture":
    case "veneer":
      return (
        <svg {...common}>
          <path d="M7 10c0-2.5 2-5 5-5s5 2.5 5 5v2c0 2-1.2 3.5-2.4 5.2L12 21l-2.6-3.8C8.2 15.5 7 14 7 12v-2Z" />
          <path d="M9 11h6" />
        </svg>
      );
    case "child":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3" />
          <path d="M7 19c1.2-2.5 2.8-3.5 5-3.5s3.8 1 5 3.5" />
          <path d="M16 6.5c1 .2 1.8.8 2.2 1.6" />
        </svg>
      );
    case "surgery":
    case "extract":
    case "wisdom":
      return (
        <svg {...common}>
          <path d="M8 4h8l1 4-3 2v7l-2 3-2-3v-7L7 8l1-4Z" />
          <path d="M10 12h4" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <path d="M12 4l8 14H4L12 4Z" />
          <path d="M12 10v4M12 16.5h.01" />
        </svg>
      );
    case "polish":
    case "fill":
    case "checkup":
    case "fluoride":
    case "tooth":
    default:
      return (
        <svg {...common}>
          <path d="M12 3c2.6 3.2 4.2 6.5 4.2 9.5A4.2 4.2 0 0 1 7.8 12.5C7.8 9.5 9.4 6.2 12 3Z" />
        </svg>
      );
  }
}
