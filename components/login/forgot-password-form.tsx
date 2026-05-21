"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/schemas/auth";
import { forgotPasswordAction } from "@/actions/forgot-password";
import { useState } from "react";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const response = await forgotPasswordAction(data);
    if (response?.error) {
      setError(response.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <Alert variant="success">
          Se o e-mail informado estiver cadastrado, você receberá um link de recuperação em breve. Verifique também sua caixa de spam.
        </Alert>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <FormField
        {...register("email")}
        type="email"
        label="E-mail"
        placeholder="Digite seu e-mail cadastrado"
        error={errors.email}
      />

      <Button type="submit" variant="primary" size="md" isLoading={loading} className="w-full">
        {loading ? "Enviando..." : "Enviar link de recuperação"}
      </Button>
    </form>
  );
}
