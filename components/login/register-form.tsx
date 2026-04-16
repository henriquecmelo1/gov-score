// src/components/forms/register-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/schemas/auth";
import { registerAction } from "@/actions/register";
import { useState } from "react";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    const response = await registerAction(data);
    if (response.error) {
      alert(response.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-950">Cadastro de Empresa</h2>
      
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
          <input {...register("cnpj")} placeholder="Apenas números" className="w-full p-2 border rounded text-gray-900" />
          {errors.cnpj && <p className="text-red-500 text-xs">{errors.cnpj.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Telefone</label>
          <input {...register("telefone")} className="w-full p-2 border rounded text-gray-900" />
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