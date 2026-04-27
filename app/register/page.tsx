import { RegisterForm } from "@/components/login/register-form";
import { AuthCard } from "@/components/auth/auth-card";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Criar conta"
      footerText="Ja tem uma conta?"
      footerLinkHref="/login"
      footerLinkText="Entrar"
    >
        <RegisterForm />
    </AuthCard>
  );
}