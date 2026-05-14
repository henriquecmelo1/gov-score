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
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
  },
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
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
      className={`rounded-md border ${styles.bg} ${styles.border} px-3 py-2 text-sm ${styles.text}`}
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
            className="inline-flex shrink-0 rounded hover:bg-black/10 p-0.5 transition"
            aria-label="Fechar alerta"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
