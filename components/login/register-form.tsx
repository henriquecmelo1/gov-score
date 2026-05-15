// src/components/forms/register-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/schemas/auth";
import { registerAction } from "@/actions/register";
import { useState } from "react";
import { formatCnpj, formatPhone } from "@/lib/formatters/input-formatters";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterInput>({
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
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <FormField
        {...register("email")}
        type="email"
        autoComplete="email"
        label="E-mail"
        error={errors.email}
      />

      <FormField
        {...register("password")}
        type="password"
        autoComplete="new-password"
        label="Senha"
        error={errors.password}
      />

      <hr className="my-4 border-border" />

      <FormField
        {...register("razao_social")}
        label="Razão Social"
        error={errors.razao_social}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          {...register("cnpj")}
          placeholder="00.000.000/0000-00"
          inputMode="numeric"
          maxLength={18}
          label="CNPJ"
          error={errors.cnpj}
          onChange={(event) => {
            const maskedValue = formatCnpj(event.target.value);
            event.target.value = maskedValue;
            setValue("cnpj", maskedValue, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
        />
        <FormField
          {...register("telefone")}
          placeholder="(00) 00000-0000"
          inputMode="tel"
          maxLength={15}
          label="Telefone"
          error={errors.telefone}
          onChange={(event) => {
            const maskedValue = formatPhone(event.target.value);
            event.target.value = maskedValue;
            setValue("telefone", maskedValue, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
        />
      </div>

      <FormField
        {...register("endereco")}
        label="Endereço Completo"
        error={errors.endereco}
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={loading}
        className="w-full"
      >
        {loading ? "Processando..." : "Criar Conta"}
      </Button>
    </form>
  );
}