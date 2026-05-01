import { getPublicSales } from "@/lib/supabase/queries";
import { SearchFilter } from "@/components/mural/search-filter";
import { NewSaleButton } from "@/components/mural/new-sale-button";
import { MuralList } from "@/components/mural/mural-list";
import { createClient } from "@/lib/supabase/server";
import { searchDebtors } from "@/lib/supabase/queries";

export default async function MuralPage({
    searchParams,
}: {
    searchParams?: Promise<{ search?: string }>;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const resolvedSearchParams = (await searchParams) ?? {};
    const [sales, debtors] = await Promise.all([
        getPublicSales(supabase, resolvedSearchParams.search),
        user ? searchDebtors(supabase) : Promise.resolve([]),
    ]);

    return (
        <main className="py-2">
            <div className="mb-8 space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="w-full md:max-w-xl">
                    <h1 className="text-3xl font-bold text-primary">Mural de Transparencia</h1>
                    <p className="text-muted-foreground">
                        Consulte vendas e histórico de pagamentos de entidades públicas.
                    </p>
                    </div>
                    {user ? <NewSaleButton debtors={debtors} /> : null}
                </div>
                <div className="w-full">
                    <SearchFilter />
                </div>
            </div>

            <MuralList sales={sales} />
        </main>
    );
}