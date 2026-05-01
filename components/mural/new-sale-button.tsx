"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NewSaleForm } from "@/components/sales/new-sale-form";
import { Modal } from "@/components/ui/modal";
import { Toast } from "@/components/ui/toast";
import { PlusIcon } from "lucide-react";
import type { Debtor } from "@/lib/schemas/debtors";

type NewSaleButtonProps = {
  debtors: Debtor[];
};

export function NewSaleButton({ debtors }: NewSaleButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-700"
      >
        <PlusIcon className="h-4 w-4" aria-hidden="true" />
        Nova venda
      </button>

      {isOpen && (
        <Modal title="Cadastrar Nova Venda" onClose={() => setIsOpen(false)}>
          <NewSaleForm
            debtors={debtors}
            onSuccess={(mode) => {
              setIsOpen(false);
              showToast(mode === "create" ? "Venda cadastrada com sucesso." : "Venda atualizada com sucesso.");
              router.refresh();
            }}
          />
        </Modal>
      )}

      {toastMessage ? <Toast message={toastMessage} /> : null}
    </>
  );
}
