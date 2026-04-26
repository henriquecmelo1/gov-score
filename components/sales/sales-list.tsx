"use client";

import { Sale } from "@/lib/schemas/sales";
import { ExternalLink, FileText } from "lucide-react";

type SalesListProps = {
  sales: Sale[];
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
};

export function SalesList({ sales, onEdit, onDelete }: SalesListProps) {
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
            <th className="p-4 font-semibold text-gray-900">Entidade Devedora</th>
            <th className="p-4 font-semibold text-gray-900">Valor (R$)</th>
            <th className="p-4 font-semibold text-gray-900">Itens/Quantidade</th>
            <th className="p-4 font-semibold text-gray-900">Data de Entrega</th>
            <th className="p-4 font-semibold text-gray-900">Nota Fiscal</th>
            <th className="p-4 font-semibold text-gray-900">Contrato</th>
            <th className="p-4 font-semibold text-gray-900">Status</th>
            <th className="p-4 font-semibold text-gray-900">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-gray-50 transition">
              <td className="p-4 text-gray-700">{sale.entidade_devedora}</td>
              <td className="p-4 text-gray-700">{sale.valor_nf}</td>
              <td className="p-4 text-gray-700">{sale.itens_quantidade}</td>
              <td className="p-4 text-gray-700">
                {new Date(sale.data_entrega).toLocaleDateString('pt-BR')}
              </td>
              <td className="p-4 text-sm">{renderUrlCell(sale.nf_url)}</td>
              <td className="p-4 text-sm">{renderUrlCell(sale.contrato_url)}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  sale.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {sale.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(sale)}
                    className="rounded border border-blue-200 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-50"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(sale)}
                    className="rounded border border-red-200 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Deletar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}