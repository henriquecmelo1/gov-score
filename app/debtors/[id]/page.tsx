import { createClient } from "@/lib/supabase/server";
import { getDebtorWithSales } from "@/lib/supabase/queries";
import { SalesList } from "@/components/sales/sales-list";
import { Sale } from "@/lib/schemas/sales";
import Link from "next/link";

type Params = { params: { id: string } };

export default async function DebtorProfile({ params }: Params) {
  const supabase = await createClient();
  const id = params.id;
  const { debtor, sales } = await getDebtorWithSales(supabase, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{debtor?.name ?? "Devedor"}</h1>
          <p className="text-sm text-gray-600">{debtor?.email}</p>
        </div>
        <div>
          <Link href="/debtors" className="text-blue-600">Voltar</Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-3">Vendas do devedor</h2>
        <SalesList sales={(sales ?? []) as Sale[]} onEdit={() => {}} onDelete={() => {}} onChangeStatus={() => {}} />
      </div>
    </div>
  );
}
