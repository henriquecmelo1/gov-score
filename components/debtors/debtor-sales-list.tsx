import { formatCurrencyBRL, formatDateBR } from "@/lib/formatters";
import { SaleStatusBadge } from "@/components/sales/sale-status-badge";
import { SaleDocumentLink } from "@/components/sales/sale-document-link";
import { EmptyState } from "@/components/ui/empty-state";
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
      <EmptyState
        description="Nenhuma venda registrada para este comprador."
        variant="bordered"
      />
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full border-collapse">
        <thead className="border-b border-border bg-surface-elevated">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
              Vendedor
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
              Valor
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
              Entrega
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
              Nota Fiscal
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
              Contrato
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-surface-elevated/50 transition-colors">
              <td className="px-4 py-3 text-sm text-foreground-muted">
                {sale.profiles?.razao_social ?? "-"}
              </td>
              <td className="px-4 py-3 text-sm text-foreground-muted">
                {formatCurrencyBRL(sale.valor_nf)}
              </td>
              <td className="px-4 py-3 text-sm text-foreground-muted">
                {formatDateBR(sale.data_entrega)}
              </td>
              <td className="px-4 py-3 text-sm text-foreground-muted">
                <SaleStatusBadge status={sale.status} />
              </td>
              <td className="px-4 py-3 text-sm text-foreground-muted">
                <SaleDocumentLink url={sale.nf_url} />
              </td>
              <td className="px-4 py-3 text-sm text-foreground-muted">
                <SaleDocumentLink url={sale.contrato_url} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
