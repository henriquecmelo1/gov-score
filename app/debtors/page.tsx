import { createClient } from "@/lib/supabase/server";
import { searchDebtors } from "@/lib/supabase/queries";
import { DebtorForm } from "@/components/debtors/debtor-form";
import { DebtorList } from "@/components/debtors/debtor-list";
import type { Debtor } from "@/lib/schemas/debtors";

export default async function DebtorsPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const sp = await searchParams;
  const q = sp?.q ?? undefined;
  const debtors = await searchDebtors(supabase, q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-gray-600">Cadastre e pesquise os clientes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start">
        <div className="md:col-span-1">
          {user ? (
            <>
              <h2 className="font-medium mb-3">Criar Cliente</h2>
              <DebtorForm />
            </>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
              Faça login para cadastrar um novo cliente.
            </div>
          )}
        </div>

        <div className="md:col-span-2 md:pt-10">
          <form method="get" className="mb-4 flex items-end gap-2">
              <input
                id="q"
                name="q"
                defaultValue={q}
                placeholder="Buscar por nome"
                className="w-full rounded border p-2"
              />
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
              Buscar
            </button>
          </form>

          <DebtorList debtors={(debtors ?? []) as Debtor[]} />
        </div>
      </div>
    </div>
  );
}
