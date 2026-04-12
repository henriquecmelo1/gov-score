"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/schemas/auth";
import { loginAction } from "@/actions/login";
import { useState } from "react";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError(null);
    
    const response = await loginAction(data);
    if (response?.error) {
      setError(response.error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">E-mail</label>
        <input 
          {...register("email")}
          type="email"
          className="w-full p-2 mt-1 border border-gray-400 rounded-md text-gray-900 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Senha</label>
        <input 
          {...register("password")}
          type="password"
          className="w-full p-2 mt-1 border border-gray-400 rounded-md text-gray-900 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-all font-medium"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}