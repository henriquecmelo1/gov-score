// src/components/forms/register-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/schemas/auth";
import { registerAction } from "@/actions/register";
import { useState } from "react";

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError(null);
    const response = await registerAction(data);
    if (response?.error) {
      setError(response.error);
      setLoading(false);
    }
  };

  const onInvalid = () => {
    setError("Revise os campos obrigatórios destacados em vermelho.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4 max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-950">Cadastro de Empresa</h2>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-600">E-mail</label>
        <input {...register("email")} type="email" autoComplete="email" className="w-full p-2 border rounded text-gray-900" />
        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600">Senha</label>
        <input {...register("password")} type="password" autoComplete="new-password" className="w-full p-2 border rounded text-gray-900" />
        {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
      </div>

      <hr className="my-4" />

      <div>
        <label className="block text-sm font-medium text-gray-600">Razão Social</label>
        <input {...register("razao_social")} className="w-full p-2 border rounded text-gray-900" />
        {errors.razao_social && <p className="text-red-500 text-xs">{errors.razao_social.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">CNPJ</label>
          <input
            {...register("cnpj")}
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            maxLength={18}
            className="w-full p-2 border rounded text-gray-900"
            onChange={(event) => {
              const maskedValue = formatCnpj(event.target.value);
              event.target.value = maskedValue;
              setValue("cnpj", maskedValue, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />
          {errors.cnpj && <p className="text-red-500 text-xs">{errors.cnpj.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Telefone</label>
          <input
            {...register("telefone")}
            placeholder="(00) 00000-0000"
            inputMode="tel"
            maxLength={15}
            className="w-full p-2 border rounded text-gray-900"
            onChange={(event) => {
              const maskedValue = formatPhone(event.target.value);
              event.target.value = maskedValue;
              setValue("telefone", maskedValue, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />
          {errors.telefone && <p className="text-red-500 text-xs">{errors.telefone.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600">Endereço Completo</label>
        <input {...register("endereco")} className="w-full p-2 border rounded text-gray-900" />
        {errors.endereco && <p className="text-red-500 text-xs">{errors.endereco.message}</p>}
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Processando..." : "Criar Conta"}
      </button>
    </form>
  );
}