import type { InputHTMLAttributes, ReactNode } from "react";
import { FieldError } from "react-hook-form";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: FieldError;
  helperText?: ReactNode;
};

export function FormField({ label, error, helperText, ...props }: FormFieldProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-foreground-muted mb-2">{label}</label>
      )}
      <input
        className={`w-full p-2 border rounded-lg transition focus:outline-none focus:ring-1 ${
          error
            ? "border-error/50 focus:border-error focus:ring-error/50"
            : "border-border focus:border-primary/60 focus:ring-primary/30"
        } text-foreground bg-surface placeholder:text-foreground-dim`}
        {...props}
      />
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
