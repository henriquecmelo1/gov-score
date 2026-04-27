"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NewSaleForm } from "@/components/sales/new-sale-form";
import { Modal } from "@/components/ui/modal";
import { Toast } from "@/components/ui/toast";

export function NewSaleButton() {
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
        className="h-10 shrink-0 whitespace-nowrap rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Nova venda
      </button>

      {isOpen && (
        <Modal title="Cadastrar Nova Venda" onClose={() => setIsOpen(false)}>
          <NewSaleForm
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
