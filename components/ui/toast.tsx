"use client";

type ToastProps = {
  message: string;
  onClose?: () => void;
  variant?: "success" | "error" | "info" | "warning";
};

const variantStyles = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
};

export function Toast({ message, onClose, variant = "success" }: ToastProps) {
  return (
    <div
      className={`fixed bottom-4 right-4 z-60 rounded-md border px-4 py-3 text-sm font-medium shadow-lg ${variantStyles[variant]}`}
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
