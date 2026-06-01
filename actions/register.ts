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

  // 1. Cria o usuário no sistema de Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: validData.email,
    password: validData.password,
  });

  if (authError) return { error: authError.message };

  const userId = authData.user?.id;
  if (!userId) {
    return { error: "Erro ao criar registro de autenticação." };
  }

  // 2. Tenta criar o perfil público usando o Admin Client
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

  // 3. A MÁGICA DO ROLLBACK: Desfazendo a criação se o perfil falhar
  if (profileError) {
    // Deleta o "usuário fantasma" do sistema de Auth
    await adminSupabase.auth.admin.deleteUser(userId);

    // Tratamento de erro amigável para CNPJ duplicado (Código 23505 do Postgres)
    if (profileError.code === '23505') {
      return { error: "Este CNPJ já está cadastrado em nossa base de dados." };
    }

    return { error: `Erro ao salvar perfil da empresa: ${profileError.message}` };
  }

  // 4. Sucesso total
  redirect("/profile");
}