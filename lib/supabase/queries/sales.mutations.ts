import { SupabaseClient } from "@supabase/supabase-js";

export async function markSalesAsOver20Days(supabase: SupabaseClient, saleIds: string[]) {
  if (saleIds.length === 0) return [];

  const { data, error } = await supabase
    .from("sales")
    .update({ status: "over_20_days" })
    .in("id", saleIds)
    .eq("status", "under_20_days")
    .select("id, status");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function markSalesAsOver30Days(supabase: SupabaseClient, saleIds: string[]) {
  if (saleIds.length === 0) return [];

  const { data, error } = await supabase
    .from("sales")
    .update({ status: "over_30_days" })
    .in("id", saleIds)
    .eq("status", "over_20_days")
    .select("id, status");

  if (error) throw new Error(error.message);
  return data ?? [];
}