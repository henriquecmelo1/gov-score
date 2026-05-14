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
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      <input
        className={`w-full p-2 border rounded transition focus:outline-none focus:ring-1 ${
          error
            ? "border-red-400 focus:border-red-600 focus:ring-red-600"
            : "border-gray-400 focus:border-blue-600 focus:ring-blue-600"
        } text-gray-900 bg-white`}
        {...props}
      />
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
