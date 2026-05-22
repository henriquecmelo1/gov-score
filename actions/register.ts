"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registerSchema, RegisterInput } from "@/lib/schemas/auth";
import { redirect } from "next/navigation";

export async function registerAction(data: RegisterInput) {
  const result = registerSchema.safeParse(data);
  
  if (!result.success) {
    return { error: "Dados inválidos" };
  }

  const validData = result.data;

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: validData.email,
    password: validData.password,
  });

  if (authError) return { error: authError.message };

  const userId = authData.user?.id;
  if (!userId) {
    return { error: "Erro ao criar registro de autenticação." };
  }

  const adminSupabase = createAdminClient();

  const { error: profileError } = await adminSupabase
    .from("profiles")
    .insert({
      id: userId,
      razao_social: validData.razao_social,
      cnpj: validData.cnpj,
      endereco: validData.endereco,
      telefone: validData.telefone,
    });

  if (profileError) {
    return { error: `Erro ao salvar perfil da empresa: ${profileError.message}` };
  }

  redirect("/profile");
}