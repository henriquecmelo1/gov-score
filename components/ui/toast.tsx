"use client";

type ToastProps = {
  message: string;
  onClose?: () => void;
  variant?: "success" | "error" | "info" | "warning";
};

const variantStyles = {
  success: "border-success-border bg-success-bg text-success",
  error: "border-error-border bg-error-bg text-error",
  info: "border-info-border bg-info-bg text-info",
  warning: "border-warning-border bg-warning-bg text-warning",
};

export function Toast({ message, onClose, variant = "success" }: ToastProps) {
  return (
    <div
      className={`fixed bottom-4 right-4 z-60 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm ${variantStyles[variant]}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-4">
        <p>{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="text-current hover:opacity-70 transition"
            aria-label="Fechar notificação"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
