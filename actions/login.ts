"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, LoginInput } from "@/lib/schemas/auth";
import { redirect } from "next/navigation";

export async function loginAction(data: LoginInput) {
  const result = loginSchema.safeParse(data);
  
  if (!result.success) {
    return { error: "Dados inválidos" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: "E-mail ou senha incorretos." };
  }

  redirect("/dashboard");
}