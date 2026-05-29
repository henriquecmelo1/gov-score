import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/login/reset-password-form";
import { AuthCard } from "@/components/auth/auth-card";

export default async function ResetPasswordPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/forgot-password");
  }

  return (
    <AuthCard
      title="Redefinir senha"
      subtitle="Digite sua nova senha abaixo para atualizar seu acesso."
      footerText="Quer voltar ao início?"
      footerLinkHref="/login"
      footerLinkText="Voltar para o Login"
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
