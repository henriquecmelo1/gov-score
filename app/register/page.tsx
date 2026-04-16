import { RegisterForm } from "@/components/login/register-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Criar conta</h1>
        </div>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta? <a href="/login" className="text-blue-600 font-medium">Entrar</a>
        </p>
      </div>
    </main>
  );
}