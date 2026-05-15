import type { ReactNode } from "react";

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  variant?: "default" | "bordered" | "card";
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  variant = "default",
}: EmptyStateProps) {
  const containerClass =
    variant === "bordered"
      ? "rounded-lg border border-dashed border-border bg-surface px-4 py-8"
      : variant === "card"
        ? "rounded-lg border border-border bg-surface-elevated px-6 py-10"
        : "text-foreground-muted";

  return (
    <div className={`text-center ${containerClass}`}>
      {icon && <div className="flex justify-center mb-4">{icon}</div>}
      {title && <p className="font-medium text-foreground mb-1">{title}</p>}
      {description && <p className="text-sm text-foreground-muted mb-4">{description}</p>}
      {action && action}
    </div>
  );
}
