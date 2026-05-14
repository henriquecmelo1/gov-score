"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { states as ecStates, cities as ecCities } from "estados-cidades";
import { FormField } from "@/components/ui/form-field";
import { FormSelect } from "@/components/ui/form-select";
import { Button } from "@/components/ui/button";

type Props = {
  initialQuery?: string;
  initialState?: string;
  initialCity?: string;
};

const BRAZIL_STATES = ecStates();

export function DebtorFilterForm({ initialQuery, initialState, initialCity }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [states, setStates] = useState<string[]>(BRAZIL_STATES);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState(initialState || "");
  const [selectedCity, setSelectedCity] = useState(initialCity || "");
  const [searchTerm, setSearchTerm] = useState(initialQuery || "");

  useEffect(() => {
    setStates(Array.isArray(BRAZIL_STATES) ? BRAZIL_STATES : []);
  }, []);

  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      return;
    }
    try {
      const list = ecCities(selectedState) || [];
      setCities(Array.isArray(list) ? list : []);
      setSelectedCity("");
    } catch (_) {
      setCities([]);
    }
  }, [selectedState]);

  function handleFilterChange() {
    const params = new URLSearchParams(searchParams);

    if (searchTerm) {
      params.set("q", searchTerm);
    } else {
      params.delete("q");
    }

    if (selectedState) {
      params.set("state", selectedState);
    } else {
      params.delete("state");
    }

    if (selectedCity) {
      params.set("city", selectedCity);
    } else {
      params.delete("city");
    }

    startTransition(() => {
      router.push(`/debtors?${params.toString()}`);
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex flex-col gap-4">
        <FormField
          type="text"
          placeholder="Buscar por nome"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          label="Buscar por nome"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            label="Estado"
          >
            <option value="">Todos</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </FormSelect>

          <FormSelect
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedState}
            label="Cidade"
          >
            <option value="">Todas</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </FormSelect>
        </div>

        <Button
          onClick={handleFilterChange}
          disabled={isPending}
          variant="primary"
          size="md"
          className="w-full"
        >
          {isPending ? "Filtrando..." : "Filtrar"}
        </Button>
      </div>
    </div>
  );
}
