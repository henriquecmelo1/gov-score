"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NewSaleForm } from "@/components/sales/new-sale-form";
import { Modal } from "@/components/ui/modal";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { PlusIcon } from "lucide-react";
import type { Debtor } from "@/lib/schemas/debtors";

type NewSaleButtonProps = {
  debtors: Debtor[];
};

export function NewSaleButton({ debtors }: NewSaleButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { message: toastMessage, show: showToast, hide: hideToast } = useToast();

  const handleSuccess = (mode: "create" | "update") => {
    setIsOpen(false);
    const message =
      mode === "create"
        ? "Venda cadastrada com sucesso."
        : "Venda atualizada com sucesso.";
    showToast(message);
    router.refresh();
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="primary"
        size="md"
        className="shrink-0"
      >
        <PlusIcon className="h-4 w-4" aria-hidden="true" />
        Nova venda
      </Button>

      {isOpen && (
        <Modal title="Cadastrar Nova Venda" onClose={() => setIsOpen(false)}>
          <NewSaleForm debtors={debtors} onSuccess={handleSuccess} />
        </Modal>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={hideToast} />
      )}
    </>
  );
}
