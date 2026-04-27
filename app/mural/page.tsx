import { getPublicSales } from "@/lib/supabase/queries";
import { SearchFilter } from "@/components/mural/search-filter";
import { NewSaleButton } from "@/components/mural/new-sale-button";
import { MuralList } from "@/components/mural/mural-list";
import { createClient } from "@/lib/supabase/server";

export default async function MuralPage({
    searchParams,
}: {
    searchParams?: Promise<{ search?: string }>;
}) {
    const supabase = await createClient();
    const resolvedSearchParams = (await searchParams) ?? {};
    const sales = await getPublicSales(supabase, resolvedSearchParams.search);

    return (
        <main className="py-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Mural de Transparencia</h1>
                    <p className="text-muted-foreground">
                        Consulte vendas e histórico de pagamentos de entidades públicas.
                    </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <SearchFilter />
                    <NewSaleButton />
                </div>
            </div>

            <MuralList sales={sales} />
        </main>
    );
}