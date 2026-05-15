"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { canMarkSaleAsPaid } from "@/lib/sales/status";
import { getDebtorNameFromSale } from "@/lib/sales/utils";
import { SaleStatusBadge } from "@/components/sales/sale-status-badge";
import { SaleDocumentLink } from "@/components/sales/sale-document-link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrencyBRL, formatDateBR } from "@/lib/formatters";
import type { SaleWithJoins } from "@/lib/supabase/queries";

type SalesListProps = {
  sales: SaleWithJoins[];
  onEdit: (sale: SaleWithJoins) => void;
  onDelete: (sale: SaleWithJoins) => void;
  onChangeStatus: (sale: SaleWithJoins) => void;
};

export function SalesList({
  sales,
  onEdit,
  onDelete,
  onChangeStatus,
}: SalesListProps) {
  const [openMenuSaleId, setOpenMenuSaleId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    placement: "top" | "bottom";
  } | null>(null);
  const openMenuRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!openMenuSaleId) return;
      const target = event.target as Node | null;
      const clickedInsideButton =
        target && openMenuRef.current && openMenuRef.current.contains(target);
      const clickedInsideMenu =
        target && menuRef.current && menuRef.current.contains(target);

      if (!clickedInsideButton && !clickedInsideMenu) {
        setOpenMenuSaleId(null);
        setMenuPosition(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [openMenuSaleId]);

  function closeMenu() {
    setOpenMenuSaleId(null);
    setMenuPosition(null);
  }

  function openMenuForSale(saleId: string, triggerElement: HTMLButtonElement) {
    const rect = triggerElement.getBoundingClientRect();
    const estimatedMenuHeight = 128;
    const estimatedMenuWidth = 160;
    const gap = 8;
    const openBelow =
      window.innerHeight - rect.bottom >= estimatedMenuHeight + gap;
    const placement: "top" | "bottom" = openBelow ? "bottom" : "top";
    const top =
      placement === "bottom"
        ? rect.bottom + gap
        : Math.max(gap, rect.top - estimatedMenuHeight - gap);
    const left = Math.min(
      Math.max(gap, rect.left),
      window.innerWidth - estimatedMenuWidth - gap
    );

    if (openMenuSaleId === saleId) {
      closeMenu();
      return;
    }

    setOpenMenuSaleId(saleId);
    setMenuPosition({ top, left, placement });
  }

  if (sales.length === 0) {
    return (
      <EmptyState
        description="Nenhuma venda registrada ainda."
        variant="bordered"
      />
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border">
      <table className="w-full bg-surface border-collapse">
        <thead className="bg-surface-elevated border-b border-border">
          <tr>
            <th className="px-4 py-2 font-semibold text-foreground w-0 text-center">
              Ações
            </th>
            <th className="px-4 py-2 font-semibold text-foreground text-center">
              Comprador
            </th>
            <th className="px-4 py-2 font-semibold text-foreground text-center">
              Valor (R$)
            </th>
            <th className="px-4 py-2 font-semibold text-foreground text-center">
              Data de Entrega
            </th>
            <th className="px-4 py-2 font-semibold text-foreground text-center">
              Status
            </th>
            <th className="px-4 py-2 font-semibold text-foreground text-center">
              Itens/Quantidade
            </th>
            <th className="px-4 py-2 font-semibold text-foreground text-center">
              Nota Fiscal
            </th>
            <th className="px-4 py-2 font-semibold text-foreground text-center">
              Contrato
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-surface-elevated/50 transition">
              <td className="px-4 py-2 align-middle text-center">
                <div
                  className="relative"
                  ref={openMenuSaleId === sale.id ? openMenuRef : undefined}
                >
                  <Button
                    type="button"
                    onClick={(event) =>
                      openMenuForSale(
                        sale.id,
                        event.currentTarget as HTMLButtonElement
                      )
                    }
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8"
                    aria-label="Abrir menu de ações"
                    aria-expanded={openMenuSaleId === sale.id}
                    aria-haspopup="menu"
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </Button>

                  {openMenuSaleId === sale.id &&
                    menuPosition &&
                    createPortal(
                      <div
                        ref={menuRef}
                        className="z-50 min-w-35 rounded-lg border border-border bg-surface-elevated p-1 shadow-lg"
                        role="menu"
                        style={{
                          position: "fixed",
                          top: menuPosition.top,
                          left: menuPosition.left,
                        }}
                      >
                        {canMarkSaleAsPaid(sale.status) && (
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              onChangeStatus(sale);
                            }}
                            className="block w-full rounded-md px-3 py-2 text-left text-sm text-success transition hover:bg-success/10"
                            role="menuitem"
                          >
                            Marcar como pago
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            closeMenu();
                            onEdit(sale);
                          }}
                          className="block w-full rounded-md px-3 py-2 text-left text-sm text-primary transition hover:bg-primary-glow"
                          role="menuitem"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            closeMenu();
                            onDelete(sale);
                          }}
                          className="block w-full rounded-md px-3 py-2 text-left text-sm text-error transition hover:bg-error/10"
                          role="menuitem"
                        >
                          Deletar
                        </button>
                      </div>,
                      document.body
                    )}
                </div>
              </td>
              <td className="px-4 py-2 align-middle text-foreground-muted text-center">
                {getDebtorNameFromSale(sale)}
              </td>
              <td className="px-4 py-2 align-middle text-foreground-muted text-center">
                {formatCurrencyBRL(sale.valor_nf)}
              </td>
              <td className="px-4 py-2 align-middle text-foreground-muted text-center">
                {formatDateBR(sale.data_entrega)}
              </td>
              <td className="px-4 py-2 align-middle text-center">
                <SaleStatusBadge status={sale.status} />
              </td>
              <td className="px-4 py-2 align-middle text-foreground-muted text-center max-w-xs truncate">
                {sale.itens_quantidade}
              </td>
              <td className="px-4 py-2 align-middle text-center text-sm">
                <SaleDocumentLink url={sale.nf_url} />
              </td>
              <td className="px-4 py-2 align-middle text-center text-sm">
                <SaleDocumentLink url={sale.contrato_url} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}