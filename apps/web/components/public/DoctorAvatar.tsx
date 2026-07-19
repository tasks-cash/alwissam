"use client";

import Image from "next/image";

export type DoctorAvatarSize = "sm" | "md" | "lg" | "xl" | "portrait";

type Props = {
  name: string;
  imageUrl?: string | null;
  size?: DoctorAvatarSize;
  className?: string;
  /** Decorative when paired with visible name nearby. */
  decorative?: boolean;
};

const SIZE_PX: Record<DoctorAvatarSize, number> = {
  sm: 36,
  md: 48,
  lg: 72,
  xl: 120,
  portrait: 320,
};

/**
 * Shared Doctor avatar: approved photo → initials fallback.
 * Does not invent remote person photos.
 */
export function DoctorAvatar({
  name,
  imageUrl,
  size = "md",
  className = "",
  decorative = false,
}: Props) {
  const px = SIZE_PX[size];
  const initial = (name || "ط").trim().charAt(0) || "ط";
  const hasPhoto = Boolean(imageUrl && imageUrl.trim());
  const alt = decorative ? "" : name;
  const classes = [
    "doctor-avatar-shared",
    `doctor-avatar-shared--${size}`,
    hasPhoto ? "doctor-avatar-shared--photo" : "doctor-avatar-shared--fallback",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (hasPhoto) {
    return (
      <span className={classes} style={{ width: px, height: px }}>
        <Image
          src={imageUrl!}
          alt={alt}
          width={px}
          height={px}
          className="doctor-avatar-shared__img"
          unoptimized
          sizes={`${px}px`}
        />
      </span>
    );
  }

  return (
    <span
      className={classes}
      style={{ width: px, height: px }}
      aria-hidden={decorative || !name ? true : undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : name}
    >
      <span className="doctor-avatar-shared__initial">{initial}</span>
    </span>
  );
}
