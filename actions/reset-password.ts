"use server";

import { createClient } from "@/lib/supabase/server";
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/schemas/auth";
import { redirect } from "next/navigation";

export async function resetPasswordAction(data: ResetPasswordInput) {
  const result = resetPasswordSchema.safeParse(data);
  if (!result.success) {
    return { error: "Dados inválidos." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });

  if (error) {
    return { error: error.message || "Erro ao atualizar a senha." };
  }

  redirect("/login?success=Senha redefinida com sucesso. Faça login com sua nova senha.");
}
