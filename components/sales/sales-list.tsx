"use client";

import { Sale } from "@/lib/schemas/sales";

type SalesListProps = {
  sales: Sale[];
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
};

export function SalesList({ sales, onEdit, onDelete }: SalesListProps) {
  function renderUrlCell(url: string | null | undefined) {
    if (!url) {
      return <span className="text-gray-400">-</span>;
    }

    const href = url.startsWith("http://") || url.startsWith("https://") ? url : undefined;

    if (href) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {url}
        </a>
      );
    }

    return <span className="text-gray-700 break-all">{url}</span>;
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
            <th className="p-4 font-semibold text-gray-900">URL NF</th>
            <th className="p-4 font-semibold text-gray-900">URL Contrato</th>
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