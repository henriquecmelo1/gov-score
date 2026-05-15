import type { Sale } from "@/lib/schemas/sales";

export type SaleStatus = Sale["status"];

export function getSaleStatusLabel(status: SaleStatus): string {
  if (status === "paid") return "Pago";
  if (status === "over_20_days") return "Perto do vencimento";
  if (status === "over_30_days") return "Pagamento atrasado";
  if (status === "under_20_days") return "Menos de 20 dias de atraso";
  return "Pagamento atrasado menos de 30 dias";
}

export function getSaleStatusClasses(status: SaleStatus): string {
  if (status === "paid") return "bg-success/15 text-success border border-success/30";
  if (status === "under_20_days") return "bg-info/15 text-info border border-info/30";
  if (status === "over_20_days") return "bg-warning/15 text-warning border border-warning/30";
  if (status === "over_30_days") return "bg-error/15 text-error border border-error/30";
  return "bg-error/15 text-error border border-error/30";
}

export function canMarkSaleAsPaid(status: SaleStatus): boolean {
  return status === "under_20_days" || status === "over_20_days" || status === "over_30_days";
}
