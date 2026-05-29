"use server";

import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/schemas/auth";

export async function forgotPasswordAction(data: ForgotPasswordInput) {
  const result = forgotPasswordSchema.safeParse(data);
  if (!result.success) {
    return { error: "E-mail inválido." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: data.email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    return { error: error.message || "Erro ao enviar código de verificação." };
  }

  return { success: true };
}
