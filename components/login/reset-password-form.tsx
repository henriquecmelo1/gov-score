"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/schemas/auth";
import { resetPasswordAction } from "@/actions/reset-password";
import { useState } from "react";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);
    setError(null);

    const response = await resetPasswordAction(data);
    if (response?.error) {
      setError(response.error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <FormField
        {...register("password")}
        type="password"
        label="Nova Senha"
        placeholder="Mínimo 8 caracteres com letras e números"
        error={errors.password}
      />

      <FormField
        {...register("confirmPassword")}
        type="password"
        label="Confirmar Nova Senha"
        placeholder="Repita a nova senha"
        error={errors.confirmPassword}
      />

      <Button type="submit" variant="primary" size="md" isLoading={loading} className="w-full">
        {loading ? "Redefinindo..." : "Salvar nova senha"}
      </Button>
    </form>
  );
}
