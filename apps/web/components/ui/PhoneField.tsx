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
  placeholder?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
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
  placeholder,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
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
      placeholder={placeholder}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      dir="ltr"
    />
  );
}
