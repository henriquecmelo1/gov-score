import { ForgotPasswordForm } from "@/components/login/forgot-password-form";
import { AuthCard } from "@/components/auth/auth-card";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Recuperar senha"
      subtitle="Insira seu e-mail para receber um link de redefinição."
      footerText="Lembrou sua senha?"
      footerLinkHref="/login"
      footerLinkText="Voltar para o Login"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
