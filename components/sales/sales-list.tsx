"use client";

import { useEffect, useRef, useState } from "react";
import { Sale } from "@/lib/schemas/sales";
import { MoreHorizontal } from "lucide-react";
import { canMarkSaleAsPaid } from "@/lib/sales/status";
import { SaleStatusBadge } from "@/components/sales/sale-status-badge";
import { SaleDocumentLink } from "@/components/sales/sale-document-link";
import { formatCurrencyBRL, formatDateBR } from "@/lib/formatters";

type SalesListProps = {
  sales: Sale[];
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
  onChangeStatus: (sale: Sale) => void;
};

export function SalesList({ sales, onEdit, onDelete, onChangeStatus }: SalesListProps) {
  const [openMenuSaleId, setOpenMenuSaleId] = useState<string | null>(null);
  const openMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!openMenuSaleId) return;
      const target = event.target as Node | null;
      if (target && openMenuRef.current && !openMenuRef.current.contains(target)) {
        setOpenMenuSaleId(null);
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
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
        <p className="text-gray-500">Nenhuma venda registrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full bg-white border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-2 font-semibold text-gray-900 w-0 text-center">Ações</th>
            <th className="px-4 py-2 font-semibold text-gray-900 text-center">Entidade Devedora</th>
            <th className="px-4 py-2 font-semibold text-gray-900 text-center">Valor (R$)</th>
            <th className="px-4 py-2 font-semibold text-gray-900 text-center">Data de Entrega</th>
            <th className="px-4 py-2 font-semibold text-gray-900 text-center">Status</th>
            <th className="px-4 py-2 font-semibold text-gray-900 text-center">Itens/Quantidade</th>
            <th className="px-4 py-2 font-semibold text-gray-900 text-center">Nota Fiscal</th>
            <th className="px-4 py-2 font-semibold text-gray-900 text-center">Contrato</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-2 align-middle text-center">
                <div className="relative" ref={openMenuSaleId === sale.id ? openMenuRef : undefined}>
                  <button
                    type="button"
                    onClick={() => setOpenMenuSaleId((current) => (current === sale.id ? null : sale.id))}
                    className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:bg-gray-100"
                    aria-label="Abrir menu de ações"
                    aria-expanded={openMenuSaleId === sale.id}
                    aria-haspopup="menu"
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </button>

                  {openMenuSaleId === sale.id && (
                    <div className="absolute left-0 top-full mt-1 z-20 min-w-35 rounded-md border border-gray-200 bg-white p-1 shadow-lg" role="menu">
                      {canMarkSaleAsPaid(sale.status) && (
                        <button
                          type="button"
                          onClick={() => {
                            closeMenu();
                            onChangeStatus(sale);
                          }}
                          className="block w-full rounded px-3 py-2 text-left text-sm text-green-700 transition hover:bg-amber-50"
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
                        className="block w-full rounded px-3 py-2 text-left text-sm text-blue-700 transition hover:bg-blue-50"
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
                        className="block w-full rounded px-3 py-2 text-left text-sm text-red-700 transition hover:bg-red-50"
                        role="menuitem"
                      >
                        Deletar
                      </button>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-2 align-middle text-gray-700 text-center">{sale.entidade_devedora}</td>
              <td className="px-4 py-2 align-middle text-gray-700 text-center">{formatCurrencyBRL(sale.valor_nf)}</td>
              <td className="px-4 py-2 align-middle text-gray-700 text-center">{formatDateBR(sale.data_entrega)}</td>
              <td className="px-4 py-2 align-middle text-center">
                <SaleStatusBadge status={sale.status} />
              </td>
              <td className="px-4 py-2 align-middle text-gray-700 text-center max-w-xs truncate">{sale.itens_quantidade}</td>
              <td className="px-4 py-2 align-middle text-center text-sm"><SaleDocumentLink url={sale.nf_url} /></td>
              <td className="px-4 py-2 align-middle text-center text-sm"><SaleDocumentLink url={sale.contrato_url} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}