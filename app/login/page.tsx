import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Acesse sua conta</h1>
          <p className="text-gray-500 mt-2 text-sm">Entre para gerenciar suas transações.</p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-gray-600">
          Não tem uma conta?{" "}
          <a href="/register" className="text-blue-600 hover:underline font-medium">
            Cadastre-se
          </a>
        </p>
      </div>
    </main>
  );
}