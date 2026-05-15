import type { ReactNode } from "react";
import { X } from "lucide-react";

type AlertVariant = "error" | "warning" | "success" | "info";

type AlertProps = {
  variant?: AlertVariant;
  children: ReactNode;
  onClose?: () => void;
  title?: string;
  role?: string;
};

const variantStyles: Record<AlertVariant, { bg: string; border: string; text: string }> = {
  error: {
    bg: "bg-error-bg",
    border: "border-error-border",
    text: "text-error",
  },
  warning: {
    bg: "bg-warning-bg",
    border: "border-warning-border",
    text: "text-warning",
  },
  success: {
    bg: "bg-success-bg",
    border: "border-success-border",
    text: "text-success",
  },
  info: {
    bg: "bg-info-bg",
    border: "border-info-border",
    text: "text-info",
  },
};

export function Alert({
  variant = "info",
  children,
  onClose,
  title,
  role = "alert",
}: AlertProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={`rounded-lg border ${styles.bg} ${styles.border} px-3 py-2 text-sm ${styles.text}`}
      role={role}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          {title && <p className="font-semibold mb-1">{title}</p>}
          {children}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="inline-flex shrink-0 rounded hover:bg-white/10 p-0.5 transition"
            aria-label="Fechar alerta"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
