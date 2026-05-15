import { SupabaseClient } from "@supabase/supabase-js";

export async function getCompanyProfile(supabase: SupabaseClient, userId: string) {
  return await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
}

export type SenderDetails = {
  razao_social: string;
  telefone: string;
  email: string;
};

export async function getSenderDetailsByCompanyId(
  supabase: SupabaseClient,
  companyId: string
): Promise<SenderDetails> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("razao_social, telefone")
    .eq("id", companyId)
    .single();

  if (profileError) throw new Error(profileError.message);

  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(companyId);

  if (userError) throw new Error(userError.message);

  return {
    razao_social: profile.razao_social ?? "[Nome da Empresa]",
    telefone: profile.telefone ?? "[Telefone]",
    email: userData.user.email ?? "[E-mail]",
  };
}