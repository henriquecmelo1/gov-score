import { RegisterForm } from "@/components/login/register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center p-2">
      <div className="w-full max-w-md rounded-xl border border-secondary bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Criar conta</h1>
        </div>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ja tem uma conta? <a href="/login" className="font-medium text-primary">Entrar</a>
        </p>
      </div>
    </main>
  );
}