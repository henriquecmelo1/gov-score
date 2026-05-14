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
    <div className="overflow-hidden rounded-lg border border-secondary bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-190 w-full border-collapse text-center">
          <thead className="border-b border-secondary bg-primary-50">
            <tr>
              <th className="p-4 font-semibold">Vendedor</th>
              <th className="p-4 font-semibold">Cliente</th>
              <th className="p-4 font-semibold">Valor</th>
              <th className="p-4 font-semibold">Entrega</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sales.map((sale) => (
              <tr key={sale.id} className="transition-colors hover:bg-primary-50">
                <td className="p-4 font-medium">{sale.profiles?.razao_social ?? "-"}</td>
                <td className="p-4">{sale.debtors?.name ?? sale.entidade_devedora}</td>
                <td className="p-4">{formatCurrencyBRL(sale.valor_nf)}</td>
                <td className="p-4">{formatDateBR(sale.data_entrega)}</td>
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
