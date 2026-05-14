import { SupabaseClient } from "@supabase/supabase-js";
import type { Debtor, DebtorCreateInput, DebtorUpdateInput } from "@/lib/schemas/debtors";
import { getSalesByDebtorId } from "./sales";

export async function getDebtorById(supabase: SupabaseClient, debtorId: string) {
  const { data, error } = await supabase
    .from("debtors")
    .select("*")
    .eq("id", debtorId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Debtor | null) ?? null;
}

export async function searchDebtors(
  supabase: SupabaseClient,
  term?: string,
  state?: string,
  city?: string
) {
  let query = supabase.from("debtors").select("*");

  if (term?.trim()) query = query.ilike("name", `%${term.trim()}%`);
  if (state) query = query.eq("state", state);
  if (city) query = query.eq("city", city);

  const { data, error } = await query.order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Debtor[];
}

export async function createDebtor(supabase: SupabaseClient, payload: DebtorCreateInput) {
  const { data, error } = await supabase
    .from("debtors")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Debtor;
}

export async function updateDebtor(
  supabase: SupabaseClient,
  debtorId: string,
  payload: DebtorUpdateInput
) {
  const { data, error } = await supabase
    .from("debtors")
    .update(payload)
    .eq("id", debtorId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Debtor;
}

export async function getDebtorWithSales(supabase: SupabaseClient, debtorId: string) {
  const [debtor, sales] = await Promise.all([
    getDebtorById(supabase, debtorId),
    getSalesByDebtorId(supabase, debtorId),
  ]);

  return { debtor, sales };
}