import { Sale } from "@/lib/schemas/sales";

export function SalesList({ sales }: { sales: Sale[] }) {
  if (sales.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
        <p className="text-gray-500">Nenhuma venda registrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left bg-white">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 font-semibold text-gray-900">Entidade Devedora</th>
            <th className="p-4 font-semibold text-gray-900">Valor (R$)</th>
            <th className="p-4 font-semibold text-gray-900">Itens/Quantidade</th>
            <th className="p-4 font-semibold text-gray-900">Data de Entrega</th>
            <th className="p-4 font-semibold text-gray-900">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-gray-50 transition">
              <td className="p-4 text-gray-700">{sale.entidade_devedora}</td>
              <td className="p-4 text-gray-700">{sale.valor_nf}</td>
              <td className="p-4 text-gray-700">{sale.itens_quantidade}</td>
              <td className="p-4 text-gray-700">
                {new Date(sale.data_entrega).toLocaleDateString('pt-BR')}
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  sale.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {sale.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}