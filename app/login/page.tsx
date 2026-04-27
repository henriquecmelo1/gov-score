import { LoginForm } from "@/components/login/login-form";
import { AuthCard } from "@/components/auth/auth-card";

export default function LoginPage() {
  return (
    <AuthCard
      title="Acesse sua conta"
      subtitle="Entre para gerenciar suas transações."
      footerText="Não tem uma conta?"
      footerLinkHref="/register"
      footerLinkText="Cadastre-se"
    >
        <LoginForm />
    </AuthCard>
  );
}