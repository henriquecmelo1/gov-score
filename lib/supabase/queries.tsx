import { SupabaseClient } from "@supabase/supabase-js";
import type { Debtor, DebtorCreateInput, DebtorUpdateInput } from "@/lib/schemas/debtors";

export type PendingSaleAlert = {
  id: string;
  company_id: string;
  entidade_devedora: string;
  data_entrega: string;
};

export async function getCompanyProfile(supabase: SupabaseClient, userId: string) {
  return await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
}

export async function getCompanySales(supabase: SupabaseClient, companyId: string) {
  return await supabase
    .from("sales")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
}

export async function getPublicSales(supabase: SupabaseClient, search?: string) {
  const selectAllSalesWithProfile = `
    *,
    profiles ( razao_social )
  `;

  const term = search?.trim();

  // No search => all sales
  if (!term) {
    const { data, error } = await supabase
      .from("sales")
      .select(selectAllSalesWithProfile)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  const [byDebtor, byProfile] = await Promise.all([
    supabase
      .from("sales")
      .select(selectAllSalesWithProfile)
      .ilike("entidade_devedora", `%${term}%`)
      .order("created_at", { ascending: false }),

    // !inner ensures the filter on profiles actually restricts sales rows
    supabase
      .from("sales")
      .select(
        `
        *,
        profiles!inner ( razao_social )
      `
      )
      .ilike("profiles.razao_social", `%${term}%`)
      .order("created_at", { ascending: false }),
  ]);

  if (byDebtor.error) throw new Error(byDebtor.error.message);
  if (byProfile.error) throw new Error(byProfile.error.message);


  const merged = [...(byDebtor.data ?? []), ...(byProfile.data ?? [])];
  const uniqueById = new Map(merged.map((sale) => [sale.id, sale]));
  
  return Array.from(uniqueById.values());
}

export async function getPendingSalesOver30Days(supabase: SupabaseClient): Promise<PendingSaleAlert[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from("sales")
    .select("id, company_id, entidade_devedora, data_entrega")
    .eq("status", "pendente")
    .lt("data_entrega", thirtyDaysAgo.toISOString())
    .order("data_entrega", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as PendingSaleAlert[];
}

export async function markSalesAsEmailSent(supabase: SupabaseClient, saleIds: string[]) {
  if (saleIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("sales")
    .update({ status: "enviado email" })
    .in("id", saleIds)
    .eq("status", "pendente")
    .select("id, status");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getDebtorById(supabase: SupabaseClient, debtorId: string) {
  const { data, error } = await supabase
    .from("debtors")
    .select("*")
    .eq("id", debtorId)
    .single();

  if (error) throw new Error(error.message);
  return data as Debtor;
}

export async function searchDebtors(supabase: SupabaseClient, term?: string) {
  const q = term?.trim();

  if (!q) {
    const { data, error } = await supabase
      .from("debtors")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return data as Debtor[];
  }

  const { data, error } = await supabase
    .from("debtors")
    .select("*")
    .ilike("name", `%${q}%`)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Debtor[];
}

export async function createDebtor(
  supabase: SupabaseClient,
  payload: DebtorCreateInput
) {
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

export async function getSalesByDebtorId(supabase: SupabaseClient, debtorId: string) {
  const selectAllSalesWithProfile = `
    *,
    profiles ( razao_social )
  `;

  const { data, error } = await supabase
    .from("sales")
    .select(selectAllSalesWithProfile)
    .eq("entidade_devedora", debtorId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getDebtorWithSales(supabase: SupabaseClient, debtorId: string) {
  const [debtorRes, salesRes] = await Promise.all([
    getDebtorById(supabase, debtorId),
    getSalesByDebtorId(supabase, debtorId),
  ]);

  return { debtor: debtorRes, sales: salesRes };
}