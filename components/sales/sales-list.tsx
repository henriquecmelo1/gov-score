"use client";

import { useEffect, useRef, useState } from "react";
import { Sale } from "@/lib/schemas/sales";
import { ExternalLink, FileText, MoreHorizontal } from "lucide-react";

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

  function canMarkAsPaid(status: Sale["status"]) {
    return status === "pendente" || status === "enviado email";
  }

  function getStatusLabel(status: Sale["status"]) {
    if (status === "pago") return "Pago";
    if (status === "enviado email") return "Aviso enviado";
    return "Pagamento atrasado menos de 30 dias";
  }

  function getStatusClasses(status: Sale["status"]) {
    if (status === "pago") return "bg-emerald-100 text-emerald-800";
    if (status === "enviado email") return "bg-sky-100 text-sky-800";
    return "bg-amber-100 text-amber-800";
  }

  function getFileName(value: string): string {
    const sanitized = value.split("?")[0];
    const lastPart = sanitized.split("/").pop();
    return lastPart ? decodeURIComponent(lastPart) : value;
  }

  function renderUrlCell(url: string | null | undefined) {
    if (!url) {
      return <span className="text-gray-400">-</span>;
    }

    const href = url.startsWith("http://") || url.startsWith("https://") ? url : undefined;
    const fileName = getFileName(url);

    if (href) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex w-full max-w-64 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-gray-700 transition hover:border-blue-300 hover:bg-blue-50"
          title={fileName}
        >
          <span className="rounded bg-red-100 p-1">
            <FileText className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 truncate text-xs">{fileName}</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-blue-600" aria-hidden="true" />
        </a>
      );
    }

    return (
      <div className="inline-flex w-full max-w-64 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-gray-700" title={fileName}>
        <span className="rounded bg-red-100 p-1">
          <FileText className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 truncate text-xs">{fileName}</span>
      </div>
    );
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
      <table className="w-full text-left bg-white">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 font-semibold text-gray-900 w-0">Ações</th>
            <th className="p-4 font-semibold text-gray-900">Entidade Devedora</th>
            <th className="p-4 font-semibold text-gray-900">Valor (R$)</th>
            <th className="p-4 font-semibold text-gray-900">Data de Entrega</th>
            <th className="p-4 font-semibold text-gray-900">Status</th>
            <th className="p-4 font-semibold text-gray-900">Itens/Quantidade</th>
            <th className="p-4 font-semibold text-gray-900">Nota Fiscal</th>
            <th className="p-4 font-semibold text-gray-900">Contrato</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-gray-50 transition">
              <td className="p-4 align-top">
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
                    <div className="absolute left-0 top-10 z-20 min-w-35 rounded-md border border-gray-200 bg-white p-1 shadow-lg" role="menu">
                      {canMarkAsPaid(sale.status) && (
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
              <td className="p-4 text-gray-700">{sale.entidade_devedora}</td>
              <td className="p-4 text-gray-700">{sale.valor_nf}</td>
              <td className="p-4 text-gray-700">
                {new Date(sale.data_entrega).toLocaleDateString('pt-BR')}
              </td>
              <td className="p-4 text-center align-middle">
                <span className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-center text-xs font-semibold leading-tight ${getStatusClasses(sale.status)}`}>
                  {getStatusLabel(sale.status)}
                </span>
              </td>
              <td className="p-4 text-gray-700">{sale.itens_quantidade}</td>
              <td className="p-4 text-sm">{renderUrlCell(sale.nf_url)}</td>
              <td className="p-4 text-sm">{renderUrlCell(sale.contrato_url)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}