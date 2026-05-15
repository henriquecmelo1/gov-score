import { SupabaseClient } from "@supabase/supabase-js";
import type { Sale } from "@/lib/schemas/sales";

export type SaleWithJoins = Sale & {
  debtors?: { name?: string | null } | null;
  profiles?: { razao_social?: string | null } | null;
};

export type PendingSaleAlert = {
  id: string;
  company_id: string;
  entidade_devedora: string;
  data_entrega: string;
};

export type PendingSaleWithDebtorDetails = {
  id: string;
  company_id: string;
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

const SELECT_SALES_WITH_JOINS = `
  *,
  debtors ( name ),
  profiles ( razao_social )
`;

const SELECT_SALES_WITH_DEBTOR_DETAILS = `
  id,
  company_id,
  numero_ordem,
  valor_nf,
  data_entrega,
  contrato_url,
  nf_url,
  entidade_devedora,
  debtors ( email, name ),
  profiles ( razao_social )
`;

function mapSaleWithDebtorDetails(sale: any): PendingSaleWithDebtorDetails {
  const debtors = Array.isArray(sale.debtors) ? sale.debtors[0] : sale.debtors;
  const profiles = Array.isArray(sale.profiles) ? sale.profiles[0] : sale.profiles;

  return {
    id: sale.id,
    company_id: sale.company_id,
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
}

export async function getCompanySales(
  supabase: SupabaseClient,
  companyId: string
): Promise<SaleWithJoins[]> {
  const { data, error } = await supabase
    .from("sales")
    .select(SELECT_SALES_WITH_JOINS)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as SaleWithJoins[];
}

export async function getPublicSales(supabase: SupabaseClient): Promise<SaleWithJoins[]> {
  const { data, error } = await supabase
    .from("sales")
    .select(SELECT_SALES_WITH_JOINS)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as SaleWithJoins[];
}

export async function getSalesStillOver30Days(
  supabase: SupabaseClient
): Promise<PendingSaleWithDebtorDetails[]> {
  const { data, error } = await supabase
    .from("sales")
    .select(SELECT_SALES_WITH_DEBTOR_DETAILS)
    .eq("status", "over_30_days")
    .order("data_entrega", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapSaleWithDebtorDetails);
}

export async function getPendingSalesOver30Days(
  supabase: SupabaseClient
): Promise<PendingSaleAlert[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from("sales")
    .select("id, company_id, entidade_devedora, data_entrega")
    .eq("status", "over_20_days")
    .lt("data_entrega", thirtyDaysAgo.toISOString())
    .order("data_entrega", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as PendingSaleAlert[];
}

export async function getSalesOver20Days(
  supabase: SupabaseClient
): Promise<PendingSaleWithDebtorDetails[]> {
  const twentyDaysAgo = new Date();
  twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

  const { data, error } = await supabase
    .from("sales")
    .select(SELECT_SALES_WITH_DEBTOR_DETAILS)
    .eq("status", "under_20_days")
    .lt("data_entrega", twentyDaysAgo.toISOString())
    .order("data_entrega", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapSaleWithDebtorDetails);
}

export async function getSalesOver30Days(
  supabase: SupabaseClient
): Promise<PendingSaleWithDebtorDetails[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from("sales")
    .select(SELECT_SALES_WITH_DEBTOR_DETAILS)
    .eq("status", "over_20_days")
    .lt("data_entrega", thirtyDaysAgo.toISOString())
    .order("data_entrega", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapSaleWithDebtorDetails);
}

export async function getSalesByDebtorId(supabase: SupabaseClient, debtorId: string) {
  const { data, error } = await supabase
    .from("sales")
    .select(`*, profiles ( razao_social )`)
    .eq("entidade_devedora", debtorId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}