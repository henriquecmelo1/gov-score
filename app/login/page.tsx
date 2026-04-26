import { LoginForm } from "@/components/login/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center p-2">
      <div className="w-full max-w-md rounded-xl border border-secondary bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Acesse sua conta</h1>
          <p className="mt-2 text-sm text-muted-foreground">Entre para gerenciar suas transacoes.</p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <a href="/register" className="font-medium text-primary hover:underline">
            Cadastre-se
          </a>
        </p>
      </div>
    </main>
  );
}