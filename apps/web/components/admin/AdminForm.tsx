import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

type FieldProps = {
  label: string;
  description?: string;
  error?: string;
  optional?: boolean;
  children: (ids: {
    id: string;
    descriptionId?: string;
    errorId?: string;
  }) => ReactNode;
};

export function AdminField({
  label,
  description,
  error,
  optional,
  children,
}: FieldProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="admin-field">
      <label htmlFor={id}>
        <span>{label}</span>
        {optional ? <small>اختياري</small> : <b aria-hidden="true">*</b>}
      </label>
      {children({ id, descriptionId, errorId })}
      {description ? <p id={descriptionId}>{description}</p> : null}
      {error ? (
        <p id={errorId} className="admin-field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const AdminInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function AdminInput(props, ref) {
  const { className, ...rest } = props;
  return <input ref={ref} className={`admin-control ${className || ""}`} {...rest} />;
});

export const AdminTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function AdminTextarea(props, ref) {
  const { className, ...rest } = props;
  return <textarea ref={ref} className={`admin-control ${className || ""}`} {...rest} />;
});

export const AdminSelect = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function AdminSelect(props, ref) {
  const { className, ...rest } = props;
  return <select ref={ref} className={`admin-control ${className || ""}`} {...rest} />;
});

export function AdminSwitch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`admin-switch-row${disabled ? " is-disabled" : ""}`}>
      <span>
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
      <span className="admin-switch">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span aria-hidden="true" />
      </span>
    </label>
  );
}

export function AdminFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="admin-form-section">
      <header>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </header>
      <div className="admin-form-grid">{children}</div>
    </section>
  );
}
