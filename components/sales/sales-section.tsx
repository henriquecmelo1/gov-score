"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SalesList } from "./sales-list";
import { NewSaleForm } from "./new-sale-form";
import { deleteSaleAction, updateSaleStatusAction } from "@/actions/sales";
import { Modal } from "@/components/ui/modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Toast } from "@/components/ui/toast";
import { PlusIcon } from "lucide-react";
import type { Debtor } from "@/lib/schemas/debtors";
import type { SaleWithJoins } from "@/lib/supabase/queries";

type SalesSectionProps = {
  initialSales: SaleWithJoins[];
  debtors: Debtor[];
};

export function SalesSection({ initialSales, debtors }: SalesSectionProps) {
  const router = useRouter();
  const [activeSale, setActiveSale] = useState<SaleWithJoins | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<SaleWithJoins | null>(null);
  const [saleToChangeStatus, setSaleToChangeStatus] = useState<SaleWithJoins | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const closeModal = () => {
    setActiveSale(null);
    setIsCreateOpen(false);
  };

  const openCreateModal = () => {
    setActiveSale(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (sale: SaleWithJoins) => {
    setActiveSale(sale);
    setIsCreateOpen(false);
  };

  const openStatusModal = (sale: SaleWithJoins) => {
    setSaleToChangeStatus(sale);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const getDebtorName = (sale: SaleWithJoins) => sale.debtors?.name ?? sale.entidade_devedora;

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

  const handleStatusUpdate = async () => {
    if (!saleToChangeStatus) return;

    const result = await updateSaleStatusAction(saleToChangeStatus.id);
    if (result.success) {
      setSaleToChangeStatus(null);
      showToast("Venda marcada como paga com sucesso.");
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
          className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Nova Venda
        </button>
      </div>

      <SalesList
        sales={initialSales}
        onEdit={openEditModal}
        onDelete={setSaleToDelete}
        onChangeStatus={openStatusModal}
      />

      {(isCreateOpen || activeSale) && (
        <Modal title={activeSale ? "Editar Venda" : "Cadastrar Nova Venda"} onClose={closeModal}>
          <NewSaleForm
            key={activeSale?.id ?? "create-sale"}
            sale={activeSale}
            debtors={debtors}
            onSuccess={(mode) => {
              closeModal();
              showToast(mode === "create" ? "Venda cadastrada com sucesso." : "Venda atualizada com sucesso.");
              router.refresh();
            }}
          />
        </Modal>
      )}

      {saleToDelete && (
        <ConfirmationModal
          title="Confirmar exclusão"
          description={`Tem certeza que deseja deletar a venda de ${getDebtorName(saleToDelete)}?`}
          warningText="Esta ação não pode ser desfeita."
          confirmLabel="Deletar"
          confirmClassName="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          onCancel={() => setSaleToDelete(null)}
          onConfirm={handleDelete}
        />
      )}

      {saleToChangeStatus && (
        <ConfirmationModal
          title="Confirmar mudança de status"
          description={`Você deseja marcar como pago a venda de ${getDebtorName(saleToChangeStatus)}?`}
          warningText="Esta ação não pode ser desfeita."
          confirmLabel="Confirmar e marcar como pago"
          confirmClassName="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          onCancel={() => setSaleToChangeStatus(null)}
          onConfirm={handleStatusUpdate}
        />
      )}

      {toastMessage ? <Toast message={toastMessage} /> : null}
    </section>
  );
}