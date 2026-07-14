"use client";

import { normalizePhoneDigits } from "@alwisam/shared-validation";

type Props = {
  id: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
};

/** Digits-only phone field. Never type=number. */
export function PhoneField({
  id,
  name = "phone",
  value,
  onChange,
  required,
  disabled,
  autoComplete = "tel",
}: Props) {
  return (
    <input
      id={id}
      name={name}
      className="input"
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={(e) => {
        onChange(normalizePhoneDigits(e.target.value));
      }}
      required={required}
      disabled={disabled}
      autoComplete={autoComplete}
      dir="ltr"
    />
  );
}
