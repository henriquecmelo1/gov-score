"use server";

import { createClient } from "@/lib/supabase/server";
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

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: authData.user?.id,
      razao_social: validData.razao_social,
      cnpj: validData.cnpj,
      endereco: validData.endereco,
      telefone: validData.telefone,
    });

  if (profileError) return { error: "Erro ao salvar perfil da empresa" };

  redirect("/profile");
}