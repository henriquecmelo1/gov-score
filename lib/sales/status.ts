import type { Sale } from "@/lib/schemas/sales";

export type SaleStatus = Sale["status"];

export function getSaleStatusLabel(status: SaleStatus): string {
  if (status === "pago") return "Pago";
  if (status === "enviado email") return "Aviso enviado";
  return "Pagamento atrasado menos de 30 dias";
}

export function getSaleStatusClasses(status: SaleStatus): string {
  if (status === "pago") return "bg-emerald-100 text-emerald-800";
  if (status === "enviado email") return "bg-sky-100 text-sky-800";
  return "bg-amber-100 text-amber-800";
}

export function canMarkSaleAsPaid(status: SaleStatus): boolean {
  return status === "pendente" || status === "enviado email";
}
