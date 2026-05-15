import { createClient } from "@/lib/supabase/server";
import { getDebtorWithSales } from "@/lib/supabase/queries";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DebtorSalesList } from "@/components/debtors/debtor-sales-list";
import { Button } from "@/components/ui/button";
import type { Sale } from "@/lib/schemas/sales";

type Params = { params: Promise<{ id: string }> };

export default async function DebtorProfile({ params }: Params) {
  const supabase = await createClient();
  const { id } = await params;
  const { debtor, sales } = await getDebtorWithSales(supabase, id);

  if (!debtor) {
    notFound();
  }

  const typedSales = (sales ?? []) as Sale[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{debtor?.name ?? "Comprador"}</h1>
          <p className="text-sm text-foreground-muted">{debtor?.email}</p>
        </div>
        <Link href="/debtors">
          <Button variant="ghost" size="md">
            Voltar
          </Button>
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-3">Vendas do comprador</h2>
        <DebtorSalesList sales={typedSales} />
      </div>
    </div>
  );
}
