import { createClient } from "@/lib/supabase/server";
import { searchDebtors } from "@/lib/supabase/queries";
import { DebtorForm } from "@/components/debtors/debtor-form";
import { DebtorList } from "@/components/debtors/debtor-list";

export default async function DebtorsPage({ searchParams }: { searchParams?: any }) {
  const supabase = await createClient();
  const sp = await searchParams;
  const q = sp?.q ?? undefined;
  const debtors = await searchDebtors(supabase, q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Devedores</h1>
          <p className="text-sm text-gray-600">Cadastre e pesquise seus devedores.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h2 className="font-medium mb-3">Criar Devedor</h2>
          <DebtorForm />
        </div>

        <div className="md:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <form method="get" className="w-full">
              <div className="flex gap-2">
                <input name="q" defaultValue={q} placeholder="Buscar por nome" className="w-full p-2 border rounded" />
                <button type="submit" className="bg-blue-600 text-white px-4 rounded">Buscar</button>
              </div>
            </form>
          </div>

          <DebtorList debtors={(debtors ?? []) as any} />
        </div>
      </div>
    </div>
  );
}
