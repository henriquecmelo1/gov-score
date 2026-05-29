"use server";

import { createClient } from "@/lib/supabase/server";
import { verifyOtpSchema, VerifyOtpInput } from "@/lib/schemas/auth";

export async function verifyOtpAction(data: VerifyOtpInput) {
  const result = verifyOtpSchema.safeParse(data);
  if (!result.success) {
    return { error: "Dados inválidos." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email: data.email,
    token: data.otp,
    type: "email",
  });

  if (error) {
    return { error: error.message || "Código inválido ou expirado." };
  }

  return { success: true };
}
