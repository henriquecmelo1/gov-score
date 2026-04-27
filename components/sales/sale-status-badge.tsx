import type { Sale } from "@/lib/schemas/sales";
import { getSaleStatusClasses, getSaleStatusLabel } from "@/lib/sales/status";

type SaleStatusBadgeProps = {
  status: Sale["status"];
};

export function SaleStatusBadge({ status }: SaleStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-center text-xs font-semibold leading-tight ${getSaleStatusClasses(status)}`}
    >
      {getSaleStatusLabel(status)}
    </span>
  );
}
