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
  if (status === "paid") return "bg-emerald-100 text-emerald-800";
  if (status === "under_20_days") return "bg-sky-100 text-sky-800";
  if (status === "over_20_days") return "bg-amber-100 text-amber-800";
  if (status === "over_30_days") return "bg-red-100 text-red-800";
  return "bg-red-100 text-red-800";
}

export function canMarkSaleAsPaid(status: SaleStatus): boolean {
  return status === "under_20_days" || status === "over_20_days" || status === "over_30_days";
}
