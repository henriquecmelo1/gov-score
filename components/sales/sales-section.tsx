"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SalesList } from "./sales-list";
import { NewSaleForm } from "./new-sale-form";
import { deleteSaleAction, updateSaleStatusAction } from "@/actions/sales";
import { Modal } from "@/components/ui/modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { getDebtorNameFromSale } from "@/lib/sales/utils";
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
  const { message: toastMessage, show: showToast, hide: hideToast } = useToast();

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
        <h2 className="text-xl font-semibold text-foreground">Minhas Vendas</h2>
        <Button
          onClick={openCreateModal}
          variant="primary"
          size="md"
          className="shrink-0"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Nova Venda
        </Button>
      </div>

      <SalesList
        sales={initialSales}
        onEdit={openEditModal}
        onDelete={setSaleToDelete}
        onChangeStatus={setSaleToChangeStatus}
      />

      {(isCreateOpen || activeSale) && (
        <Modal
          title={activeSale ? "Editar Venda" : "Cadastrar Nova Venda"}
          onClose={closeModal}
        >
          <NewSaleForm
            key={activeSale?.id ?? "create-sale"}
            sale={activeSale}
            debtors={debtors}
            onSuccess={(mode) => {
              closeModal();
              showToast(
                mode === "create"
                  ? "Venda cadastrada com sucesso."
                  : "Venda atualizada com sucesso."
              );
              router.refresh();
            }}
          />
        </Modal>
      )}

      {saleToDelete && (
        <ConfirmationModal
          title="Confirmar exclusão"
          description={`Tem certeza que deseja deletar a venda de ${getDebtorNameFromSale(saleToDelete)}?`}
          warningText="Esta ação não pode ser desfeita."
          confirmLabel="Deletar"
          confirmClassName="rounded-lg bg-error/20 border border-error/30 px-4 py-2 text-sm font-medium text-error hover:bg-error/30"
          onCancel={() => setSaleToDelete(null)}
          onConfirm={handleDelete}
        />
      )}

      {saleToChangeStatus && (
        <ConfirmationModal
          title="Confirmar mudança de status"
          description={`Você deseja marcar como pago a venda de ${getDebtorNameFromSale(saleToChangeStatus)}?`}
          warningText="Esta ação não pode ser desfeita."
          confirmLabel="Confirmar e marcar como pago"
          confirmClassName="rounded-lg bg-success/20 border border-success/30 px-4 py-2 text-sm font-medium text-success hover:bg-success/30"
          onCancel={() => setSaleToChangeStatus(null)}
          onConfirm={handleStatusUpdate}
        />
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={hideToast} />
      )}
    </section>
  );
}