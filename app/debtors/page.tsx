import { createClient } from "@/lib/supabase/server";
import { searchDebtors } from "@/lib/supabase/queries";
import { DebtorForm } from "@/components/debtors/debtor-form";
import { DebtorList } from "@/components/debtors/debtor-list";
import { DebtorFilterForm } from "@/components/debtors/debtor-filter-form";
import type { Debtor } from "@/lib/schemas/debtors";

export default async function DebtorsPage({ searchParams }: { searchParams?: Promise<{ q?: string; state?: string; city?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const sp = await searchParams;
  const q = sp?.q ?? undefined;
  const state = sp?.state ?? undefined;
  const city = sp?.city ?? undefined;
  const debtors = await searchDebtors(supabase, q, state, city);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-gray-600">Cadastre e pesquise os clientes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_2fr] md:items-start">
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 font-medium">Filtros</h2>
            <DebtorFilterForm initialQuery={q} initialState={state} initialCity={city} />
          </div>

          <div>
            <h2 className="mb-3 font-medium">Adicionar Novo Cliente</h2>
            {user ? (
              <DebtorForm />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
                Faça login para cadastrar um novo cliente.
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-medium">Clientes Cadastrados</h2>
          <DebtorList debtors={(debtors ?? []) as Debtor[]} />
        </div>
      </div>
    </div>
  );
}
