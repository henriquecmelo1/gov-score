import { createClient } from "@/lib/supabase/server";
import { getDebtorWithSales } from "@/lib/supabase/queries";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DebtorSalesList } from "@/components/debtors/debtor-sales-list";

type Params = { params: Promise<{ id: string }> };

export default async function DebtorProfile({ params }: Params) {
  const supabase = await createClient();
  const { id } = await params;
  const { debtor, sales } = await getDebtorWithSales(supabase, id);

  if (!debtor) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{debtor?.name ?? "Cliente"}</h1>
          <p className="text-sm text-gray-600">{debtor?.email}</p>
        </div>
        <div>
          <Link href="/debtors" className="text-blue-600">Voltar</Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-3">Vendas do cliente</h2>
        <DebtorSalesList sales={(sales ?? []) as any} />
      </div>
    </div>
  );
}
