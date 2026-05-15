"use client";

import type { ReactNode } from "react";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidthClassName?: string;
};

export function Modal({ title, onClose, children, maxWidthClassName = "max-w-3xl" }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full ${maxWidthClassName} max-h-[90vh] overflow-y-auto`}>
        <div className="rounded-xl bg-surface border border-border-glow shadow-2xl glow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1 text-sm font-medium text-foreground-muted hover:bg-surface-elevated hover:text-foreground transition"
            >
              Fechar
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
