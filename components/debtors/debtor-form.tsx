"use client";

import { useEffect, useState } from "react";
import { states as ecStates, cities as ecCities } from "estados-cidades";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debtorCreateSchema, type DebtorCreateInput } from "@/lib/schemas/debtors";
import { createDebtorAction } from "@/actions/debtors";

type Props = {
  onSuccess?: () => void;
};

const BRAZIL_STATES = ecStates();

export function DebtorForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [states, setStates] = useState<string[]>(BRAZIL_STATES);
  const [cities, setCities] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<DebtorCreateInput>({
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
    } catch (_) {
      setCities([]);
    }
  }, [selectedState]);

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
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <input {...register("name")} className="w-full p-2 border rounded" />
        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">E-mail</label>
        <input {...register("email")} type="email" className="w-full p-2 border rounded" />
        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <select {...register("state")} className="w-full p-2 border rounded">
            <option value="">Selecione</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cidade</label>
          <select {...register("city")} className="w-full p-2 border rounded">
            <option value="">Selecione</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
        {loading ? "Criando..." : "Criar Devedor"}
      </button>
    </form>
  );
}
