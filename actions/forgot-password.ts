"use server";

import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/schemas/auth";
import { headers } from "next/headers";

export async function forgotPasswordAction(data: ForgotPasswordInput) {
  const result = forgotPasswordSchema.safeParse(data);
  if (!result.success) {
    return { error: "E-mail inválido." };
  }

  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin") || "";

  console.log("sem erro1")
  
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  console.log('aaaaaaaaaaa')
  
  if (error) {
    console.log("com erro")
    return { error: error.message || "Erro ao enviar e-mail de redefinição." };
  }

  console.log("sem erro 2")
  return { success: true };
}
