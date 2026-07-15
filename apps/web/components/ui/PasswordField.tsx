"use client";

import { useEffect, useState } from "react";

type Props = {
  id: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
  hint?: string;
};

export function PasswordField({
  id,
  name = "password",
  value,
  onChange,
  autoComplete = "current-password",
  required,
  minLength,
  disabled,
  hint,
}: Props) {
  const [show, setShow] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (typeof e.getModifierState === "function") {
        setCapsLock(e.getModifierState("CapsLock"));
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);

  return (
    <div>
      <div className="password-wrap">
        <input
          id={id}
          name={name}
          className="input"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          disabled={disabled}
          dir="ltr"
          spellCheck={false}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        >
          {show ? "إخفاء" : "إظهار"}
        </button>
      </div>
      {hint ? <div className="hint">{hint}</div> : null}
      {capsLock ? (
        <div className="hint" style={{ color: "var(--warning)" }}>
          تنبيه: مفتاح Caps Lock مفعّل
        </div>
      ) : null}
    </div>
  );
}
