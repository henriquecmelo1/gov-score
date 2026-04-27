"use client";

type ToastProps = {
  message: string;
};

export function Toast({ message }: ToastProps) {
  return (
    <div
      className="fixed bottom-4 right-4 z-60 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-lg"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
