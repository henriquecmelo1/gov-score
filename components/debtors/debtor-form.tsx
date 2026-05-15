"use client";

import { useEffect, useState } from "react";
import { states as ecStates, cities as ecCities } from "estados-cidades";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debtorCreateSchema, type DebtorCreateInput } from "@/lib/schemas/debtors";
import { createDebtorAction } from "@/actions/debtors";
import { FormField } from "@/components/ui/form-field";
import { FormSelect } from "@/components/ui/form-select";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Props = {
  onSuccess?: () => void;
};

const BRAZIL_STATES = ecStates();

export function DebtorForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [states, setStates] = useState<string[]>(BRAZIL_STATES);
  const [cities, setCities] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<DebtorCreateInput>({
    resolver: zodResolver(debtorCreateSchema),
  });

  const selectedState = watch("state");

  useEffect(() => {
    setStates(Array.isArray(BRAZIL_STATES) ? BRAZIL_STATES : []);
  }, []);

  useEffect(() => {
    if (!selectedState) return setCities([]);
    try {
      const list = ecCities(selectedState) || [];
      setCities(Array.isArray(list) ? list : []);
      setValue("city", "");
    } catch (_) {
      setCities([]);
    }
  }, [selectedState, setValue]);

  const onSubmit = async (data: DebtorCreateInput) => {
    setLoading(true);
    setError(null);
    const result = await createDebtorAction(data as DebtorCreateInput);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      if (onSuccess) onSuccess();
    }
  };

  const onInvalid = () => setError("Revise os campos obrigatórios destacados em vermelho.");

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4 rounded-xl border border-border bg-surface p-4">
      {error && <Alert variant="error">{error}</Alert>}

      <FormField
        {...register("name")}
        label="Nome"
        error={errors.name}
      />

      <FormField
        {...register("email")}
        type="email"
        label="E-mail"
        error={errors.email}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          {...register("state")}
          label="Estado"
          error={errors.state}
        >
          <option value="">Selecione</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </FormSelect>

        <FormSelect
          {...register("city")}
          label="Cidade"
          error={errors.city}
          disabled={!selectedState}
        >
          <option value="">Selecione</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </FormSelect>
      </div>

      <Button type="submit" variant="primary" size="md" isLoading={loading} className="w-full">
        {loading ? "Criando..." : "Criar Comprador"}
      </Button>
    </form>
  );
}
