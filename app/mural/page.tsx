import { getPublicSales } from "@/lib/supabase/queries";
import { SearchFilter } from "@/components/mural/search-filter";
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
        <main className="container mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Mural de Transparência</h1>
                    <p className="text-muted-foreground">
                        Consulte vendas e histórico de pagamentos de entidades públicas.
                    </p>
                </div>
                <SearchFilter />
            </div>

            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
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
                                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium">{sale.profiles?.razao_social ?? "-"}</td>
                                    <td className="p-4">{sale.entidade_devedora}</td>
                                    <td className="p-4">
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(Number(sale.valor) || 0)}
                                    </td>
                                    <td className="p-4">
                                        {sale.data_entrega
                                            ? new Date(sale.data_entrega).toLocaleDateString("pt-BR")
                                            : "-"}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${sale.status === "Pago"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {sale.status}
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
        </main>
    );
}