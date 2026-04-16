import { SupabaseClient } from "@supabase/supabase-js";

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