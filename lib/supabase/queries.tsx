import { SupabaseClient } from "@supabase/supabase-js";
import type { Sale } from "@/lib/schemas/sales";
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

export type SaleWithJoins = Sale & {
  debtors?: {
    name?: string | null;
  } | null;
  profiles?: {
    razao_social?: string | null;
  } | null;
};

export async function getCompanySales(supabase: SupabaseClient, companyId: string): Promise<SaleWithJoins[]> {
  const selectAllSalesWithJoins = `
    *,
    debtors ( name ),
    profiles ( razao_social )
  `;

  const { data, error } = await supabase
    .from("sales")
    .select(selectAllSalesWithJoins)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as SaleWithJoins[];
}

export async function getPublicSales(supabase: SupabaseClient): Promise<SaleWithJoins[]> {
  const selectAllSalesWithJoins = `
    *,
    debtors ( name ),
    profiles ( razao_social )
  `;

  const { data, error } = await supabase
    .from("sales")
    .select(selectAllSalesWithJoins)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as SaleWithJoins[];
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

export type PendingSaleWithDebtorDetails = {
  id: string;
  numero_ordem: string;
  valor_nf: string;
  data_entrega: string;
  contrato_url: string | null;
  nf_url: string | null;
  entidade_devedora: string;
  debtor_email: string;
  debtor_name: string;
  company_name: string;
};

export async function getPendingSalesOver30DaysForDebtors(
  supabase: SupabaseClient
): Promise<PendingSaleWithDebtorDetails[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const selectSalesWithDetails = `
    id,
    numero_ordem,
    valor_nf,
    data_entrega,
    contrato_url,
    nf_url,
    entidade_devedora,
    debtors ( email, name ),
    profiles ( razao_social )
  `;

  const { data, error } = await supabase
    .from("sales")
    .select(selectSalesWithDetails)
    .eq("status", "pendente")
    .lt("data_entrega", thirtyDaysAgo.toISOString())
    .order("data_entrega", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((sale) => {
    const debtors = Array.isArray(sale.debtors) ? sale.debtors[0] : sale.debtors;
    const profiles = Array.isArray(sale.profiles) ? sale.profiles[0] : sale.profiles;

    return {
      id: sale.id,
      numero_ordem: sale.numero_ordem,
      valor_nf: sale.valor_nf,
      data_entrega: sale.data_entrega,
      contrato_url: sale.contrato_url,
      nf_url: sale.nf_url,
      entidade_devedora: sale.entidade_devedora,
      debtor_email: debtors?.email ?? "",
      debtor_name: debtors?.name ?? "Devedor",
      company_name: profiles?.razao_social ?? "Empresa",
    };
  }) as PendingSaleWithDebtorDetails[];
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
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Debtor | null) ?? null;
}

export async function searchDebtors(supabase: SupabaseClient, term?: string, state?: string, city?: string) {
  const q = term?.trim();
  let query = supabase.from("debtors").select("*");

  // Apply name filter
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  if (state) {
    query = query.eq("state", state);
  }

  if (city) {
    query = query.eq("city", city);
  }

  const { data, error } = await query.order("name", { ascending: true });

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