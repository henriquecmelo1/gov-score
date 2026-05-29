import { Suspense } from "react";
import { VerifyOtpForm } from "@/components/login/verify-otp-form";
import { AuthCard } from "@/components/auth/auth-card";

export default function VerifyOtpPage() {
  return (
    <AuthCard
      title="Verificar código"
      subtitle="Digite o código de 6 dígitos enviado para seu e-mail."
      footerText="Não recebeu o código?"
      footerLinkHref="/forgot-password"
      footerLinkText="Reenviar código"
    >
      <Suspense fallback={null}>
        <VerifyOtpForm />
      </Suspense>
    </AuthCard>
  );
}
