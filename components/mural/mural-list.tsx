import { formatCurrencyBRL, formatDateBR } from "@/lib/formatters";
import { SaleStatusBadge } from "@/components/sales/sale-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Sale } from "@/lib/schemas/sales";

type MuralSale = Sale & {
  profiles?: {
    razao_social?: string | null;
  } | null;
  debtors?: {
    name?: string | null;
  } | null;
};

type MuralListProps = {
  sales: MuralSale[];
};

export function MuralList({ sales }: MuralListProps) {
  if (sales.length === 0) {
    return (
      <EmptyState
        description="Nenhuma venda encontrada para esta busca."
        variant="bordered"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-190 w-full border-collapse text-center">
          <thead className="border-b border-border bg-surface-elevated">
            <tr>
              <th className="p-4 font-semibold text-foreground">Vendedor</th>
              <th className="p-4 font-semibold text-foreground">Comprador</th>
              <th className="p-4 font-semibold text-foreground">Valor</th>
              <th className="p-4 font-semibold text-foreground">Entrega</th>
              <th className="p-4 font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sales.map((sale) => (
              <tr key={sale.id} className="transition-colors hover:bg-surface-elevated/50">
                <td className="p-4 font-medium text-foreground">{sale.profiles?.razao_social ?? "-"}</td>
                <td className="p-4 text-foreground-muted">{sale.debtors?.name ?? sale.entidade_devedora}</td>
                <td className="p-4 text-foreground-muted">{formatCurrencyBRL(sale.valor_nf)}</td>
                <td className="p-4 text-foreground-muted">{formatDateBR(sale.data_entrega)}</td>
                <td className="p-4 text-center align-middle">
                  <SaleStatusBadge status={sale.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
