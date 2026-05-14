import type { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-700 disabled:bg-gray-400",
  secondary: "border border-primary bg-white text-primary hover:bg-primary-50",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-400",
  ghost: "text-gray-600 hover:bg-gray-100 disabled:text-gray-400",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs font-medium rounded-md",
  md: "h-10 px-4 text-sm font-semibold rounded-md",
  lg: "h-12 px-6 text-base font-semibold rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap transition disabled:cursor-not-allowed";

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ""}`}
      {...props}
    >
      {children}
      {isLoading && (
        <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
      )}
    </button>
  );
}
