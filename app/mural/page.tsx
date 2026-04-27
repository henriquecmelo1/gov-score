import { getPublicSales } from "@/lib/supabase/queries";
import { SearchFilter } from "@/components/mural/search-filter";
import { NewSaleButton } from "@/components/mural/new-sale-button";
import { createClient } from "@/lib/supabase/server";

function getStatusLabel(status: string) {
    if (status === "pago") return "Pago";
    if (status === "enviado email") return "Aviso enviado";
    return "Pagamento atrasado menos de 30 dias";
}

function getStatusClasses(status: string) {
    if (status === "pago") return "bg-emerald-100 text-emerald-800";
    if (status === "enviado email") return "bg-sky-100 text-sky-800";
    return "bg-amber-100 text-amber-800";
}

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

            <div className="overflow-hidden rounded-lg border border-secondary bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-190 w-full text-left border-collapse">
                        <thead className="border-b border-secondary bg-primary-50">
                            <tr>
                                <th className="p-4 font-semibold">Empresa</th>
                                <th className="p-4 font-semibold">Entidade Devedora</th>
                                <th className="p-4 font-semibold">Valor</th>
                                <th className="p-4 font-semibold">Entrega</th>
                                <th className="p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {sales.length > 0 ? (
                                sales.map((sale) => (
                                    <tr key={sale.id} className="transition-colors hover:bg-primary-50">
                                        <td className="p-4 font-medium">{sale.profiles?.razao_social ?? "-"}</td>
                                        <td className="p-4">{sale.entidade_devedora}</td>
                                        <td className="p-4">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(Number(sale.valor_nf) || 0)}
                                        </td>
                                        <td className="p-4">
                                            {sale.data_entrega
                                                ? new Date(sale.data_entrega).toLocaleDateString("pt-BR")
                                                : "-"}
                                        </td>
                                        <td className="p-4 text-center align-middle">
                                            <span className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-center text-xs font-semibold leading-tight ${getStatusClasses(String(sale.status))}`}>
                                                {getStatusLabel(String(sale.status))}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        Nenhuma venda encontrada para esta busca.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}