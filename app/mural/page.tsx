import { getPublicSales, searchDebtors } from "@/lib/supabase/queries";
import { SearchFilter } from "@/components/mural/search-filter";
import { NewSaleButton } from "@/components/mural/new-sale-button";
import { MuralList } from "@/components/mural/mural-list";
import { createClient } from "@/lib/supabase/server";

function normalizeText(value: string | null | undefined) {
    return (value ?? "").trim().toLowerCase();
}

export default async function MuralPage({
    searchParams,
}: {
    searchParams?: Promise<{ search?: string }>;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const resolvedSearchParams = (await searchParams) ?? {};
    const term = normalizeText(resolvedSearchParams.search);
    const [sales, allDebtors, matchedDebtors] = await Promise.all([
        getPublicSales(supabase),
        searchDebtors(supabase),
        term ? searchDebtors(supabase, term) : Promise.resolve([]),
    ]);

    const debtorNameById = new Map(allDebtors.map((debtor) => [String(debtor.id), debtor.name]));
    const matchedDebtorIds = new Set(matchedDebtors.map((debtor) => String(debtor.id)));

    const filteredSales = term
        ? sales.filter((sale) => {
            const companyNameMatches = normalizeText(sale.profiles?.razao_social).includes(term);
            const debtorIdMatches = normalizeText(sale.entidade_devedora).includes(term);
            const debtorNameMatches = matchedDebtorIds.has(String(sale.entidade_devedora));

            return companyNameMatches || debtorIdMatches || debtorNameMatches;
        })
        : sales;

    const salesWithDebtorNames = filteredSales.map((sale) => ({
        ...sale,
        debtors: {
            name: debtorNameById.get(String(sale.entidade_devedora)) ?? null,
        },
    }));

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
                    {user ? <NewSaleButton debtors={allDebtors} /> : null}
                </div>
                <div className="w-full">
                    <SearchFilter />
                </div>
            </div>

            <MuralList sales={salesWithDebtorNames} />
        </main>
    );
}