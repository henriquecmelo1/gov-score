import type { SelectHTMLAttributes, ReactNode } from "react";
import { FieldError } from "react-hook-form";

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: FieldError;
  helperText?: ReactNode;
  options?: Array<{ value: string; label: string }>;
  children?: ReactNode;
};

export function FormSelect({
  label,
  error,
  helperText,
  options = [],
  children,
  ...props
}: FormSelectProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-foreground-muted mb-2">{label}</label>
      )}
      <select
        className={`w-full p-2 border rounded-lg transition focus:outline-none focus:ring-1 ${
          error
            ? "border-error/50 focus:border-error focus:ring-error/50"
            : "border-border focus:border-primary/60 focus:ring-primary/30"
        } text-foreground bg-surface disabled:bg-surface-elevated disabled:cursor-not-allowed disabled:text-foreground-dim`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
      {error && (
        <p className="text-error text-xs mt-1" role="alert">
          {error.message}
        </p>
      )}
      {helperText && !error && (
        <p className="text-foreground-dim text-xs mt-1">{helperText}</p>
      )}
    </div>
  );
}
