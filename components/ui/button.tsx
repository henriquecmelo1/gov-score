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
  primary:
    "bg-primary text-background font-semibold hover:bg-primary-hover hover:shadow-[0_0_20px_-3px_var(--primary-glow)] disabled:bg-foreground-dim disabled:text-background disabled:shadow-none",
  secondary:
    "border border-primary/40 bg-transparent text-primary hover:bg-primary-glow hover:border-primary/60 hover:shadow-[0_0_15px_-3px_var(--primary-glow)] disabled:border-foreground-dim disabled:text-foreground-dim",
  danger:
    "bg-error/20 border border-error/30 text-error hover:bg-error/30 hover:border-error/50 disabled:opacity-50",
  success:
    "bg-success/20 border border-success/30 text-success hover:bg-success/30 hover:border-success/50 disabled:opacity-50",
  ghost:
    "text-foreground-muted hover:bg-surface-elevated hover:text-foreground disabled:text-foreground-dim",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs font-medium rounded-lg",
  md: "h-10 px-4 text-sm font-semibold rounded-lg",
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
    "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 disabled:cursor-not-allowed";

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
