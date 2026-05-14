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
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      <select
        className={`w-full p-2 border rounded transition focus:outline-none focus:ring-1 ${
          error
            ? "border-red-400 focus:border-red-600 focus:ring-red-600"
            : "border-gray-400 focus:border-blue-600 focus:ring-blue-600"
        } text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
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
        <p className="text-red-500 text-xs mt-1" role="alert">
          {error.message}
        </p>
      )}
      {helperText && !error && (
        <p className="text-gray-500 text-xs mt-1">{helperText}</p>
      )}
    </div>
  );
}
