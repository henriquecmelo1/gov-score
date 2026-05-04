"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { states as ecStates, cities as ecCities } from "estados-cidades";

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
      // Reset city when state changes
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
    <div className="mb-6 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Buscar por nome</label>
          <input
            type="text"
            placeholder="Buscar por nome"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border p-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full rounded border p-2"
            >
              <option value="">Todos</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedState}
              className="w-full rounded border p-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Todas</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleFilterChange}
          disabled={isPending}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isPending ? "Filtrando..." : "Filtrar"}
        </button>
      </div>
    </div>
  );
}
