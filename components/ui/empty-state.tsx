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
      ? "rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8"
      : variant === "card"
        ? "rounded-lg border border-gray-200 bg-gray-50 px-6 py-10"
        : "text-gray-500";

  return (
    <div className={`text-center ${containerClass}`}>
      {icon && <div className="flex justify-center mb-4">{icon}</div>}
      {title && <p className="font-medium text-gray-900 mb-1">{title}</p>}
      {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
      {action && action}
    </div>
  );
}
