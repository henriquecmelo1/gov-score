"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NewSaleForm } from "@/components/sales/new-sale-form";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="rounded-xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">Cadastrar Nova Venda</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Fechar
                </button>
              </div>
              <div className="p-6">
                <NewSaleForm
                  onSuccess={(mode) => {
                    setIsOpen(false);
                    showToast(mode === "create" ? "Venda cadastrada com sucesso." : "Venda atualizada com sucesso.");
                    router.refresh();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-60 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-lg" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </>
  );
}
