"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Sale } from "@/lib/schemas/sales";
import { SalesList } from "./sales-list";
import { NewSaleForm } from "./new-sale-form"; // O formulário que criamos anteriormente
import { deleteSaleAction } from "@/actions/sales";

type SalesSectionProps = {
  initialSales: Sale[];
};

export function SalesSection({ initialSales }: SalesSectionProps) {
  const router = useRouter();
  const [activeSale, setActiveSale] = useState<Sale | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const closeModal = () => {
    setActiveSale(null);
    setIsCreateOpen(false);
  };

  const openCreateModal = () => {
    setActiveSale(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (sale: Sale) => {
    setActiveSale(sale);
    setIsCreateOpen(false);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleDelete = async () => {
    if (!saleToDelete) return;

    const result = await deleteSaleAction(saleToDelete.id);
    if (result.success) {
      setSaleToDelete(null);
      router.refresh();
      return;
    }

    alert(result.error);
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Minhas Vendas</h2>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:opacity-90 transition"
        >
          Nova Venda
        </button>
      </div>

      <SalesList
        sales={initialSales}
        onEdit={openEditModal}
        onDelete={setSaleToDelete}
      />

      {(isCreateOpen || activeSale) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="rounded-xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeSale ? "Editar Venda" : "Cadastrar Nova Venda"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Fechar
                </button>
              </div>
              <div className="p-6">
                <NewSaleForm
                  sale={activeSale}
                  onSuccess={(mode) => {
                    closeModal();
                    showToast(mode === "create" ? "Venda cadastrada com sucesso." : "Venda atualizada com sucesso.");
                    router.refresh();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {saleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirmar exclusão</h3>
            </div>
            <div className="space-y-4 px-6 py-5">
              <p className="text-sm text-gray-700">
                Tem certeza que deseja deletar a venda de <strong>{saleToDelete.entidade_devedora}</strong>?
              </p>
              <p className="text-sm text-gray-500">
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setSaleToDelete(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-60 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-lg" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </section>
  );
}