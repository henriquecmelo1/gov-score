import { formatCurrencyBRL, formatDateBR } from "@/lib/formatters";
import { SaleStatusBadge } from "@/components/sales/sale-status-badge";
import { SaleDocumentLink } from "@/components/sales/sale-document-link";
import type { Sale } from "@/lib/schemas/sales";

type DebtorSale = Sale & {
  profiles?: {
    razao_social?: string | null;
  } | null;
};

type DebtorSalesListProps = {
  sales: DebtorSale[];
};

export function DebtorSalesList({ sales }: DebtorSalesListProps) {
  if (!sales || sales.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-gray-500">
        Nenhuma venda registrada para este devedor.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full border-collapse">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Empresa</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Valor</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Entrega</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Nota Fiscal</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Contrato</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-700">{sale.profiles?.razao_social ?? "-"}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{formatCurrencyBRL(sale.valor_nf)}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{formatDateBR(sale.data_entrega)}</td>
              <td className="px-4 py-3 text-sm text-gray-700"><SaleStatusBadge status={sale.status} /></td>
              <td className="px-4 py-3 text-sm text-gray-700"><SaleDocumentLink url={sale.nf_url} /></td>
              <td className="px-4 py-3 text-sm text-gray-700"><SaleDocumentLink url={sale.contrato_url} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
