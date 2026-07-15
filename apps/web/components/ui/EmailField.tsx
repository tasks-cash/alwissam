"use client";

import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  id: string;
};

/** Email field: label/parent stay RTL; value stays LTR. */
export function EmailField({ className = "input", ...rest }: Props) {
  return (
    <input
      {...rest}
      className={className}
      type="email"
      inputMode="email"
      autoComplete={rest.autoComplete ?? "email"}
      dir="ltr"
      spellCheck={false}
    />
  );
}
