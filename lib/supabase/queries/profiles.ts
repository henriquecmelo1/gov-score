import { SupabaseClient } from "@supabase/supabase-js";

export async function getCompanyProfile(supabase: SupabaseClient, userId: string) {
  return await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
}