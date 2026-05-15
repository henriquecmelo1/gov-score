"use client";

import { Modal } from "@/components/ui/modal";

type ConfirmationModalProps = {
  title: string;
  description: string;
  warningText?: string;
  confirmLabel: string;
  confirmClassName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmationModal({
  title,
  description,
  warningText,
  confirmLabel,
  confirmClassName,
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  return (
    <Modal title={title} onClose={onCancel} maxWidthClassName="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-foreground-muted">{description}</p>
        {warningText ? <p className="text-sm text-error">{warningText}</p> : null}
      </div>
      <div className="mt-5 flex justify-end gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-elevated hover:text-foreground transition"
        >
          Cancelar
        </button>
        <button type="button" onClick={onConfirm} className={confirmClassName}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
