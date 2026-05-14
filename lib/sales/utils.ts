import type { Debtor } from "@/lib/schemas/debtors";
import type { SaleWithJoins } from "@/lib/supabase/queries";

/**
 * Utility to get debtor name from a sale
 * Uses the joined debtor name when available, falls back to the raw entity ID
 */
export function getDebtorNameFromSale(
  sale: SaleWithJoins | null | undefined,
  debtorNameMap?: Map<string, string | null>
): string {
  if (!sale) return "";

  // Prefer the joined debtor name from SaleWithJoins
  if (sale.debtors?.name) {
    return sale.debtors.name;
  }

  const debtorId = String(sale.entidade_devedora);

  if (debtorNameMap) {
    return debtorNameMap.get(debtorId) ?? debtorId;
  }

  return debtorId;
}

/**
 * Utility to create a debtor name to ID map
 * Useful for avoiding repeated debtor lookups
 */
export function createDebtorNameMap(
  debtors: Debtor[]
): Map<string, string | null> {
  return new Map(debtors.map((debtor) => [String(debtor.id), debtor.name]));
}

/**
 * Normalize text for search/comparison
 * Removes extra whitespace and converts to lowercase
 */
export function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}
