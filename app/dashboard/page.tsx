// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SalesList } from "@/components/dashboard/sales-list";
import { getCompanyProfile, getCompanySales } from "@/lib/supabase/queries";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: sales }] = await Promise.all([
    getCompanyProfile(supabase, user.id),
    getCompanySales(supabase, user.id)
  ]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Perfil da Empresa</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p><strong>Razão Social:</strong> {profile?.razao_social}</p>
          <p><strong>CNPJ:</strong> {profile?.cnpj}</p>
          <p><strong>E-mail:</strong> {user.email}</p>
          <p><strong>Telefone:</strong> {profile?.telefone}</p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Minhas Vendas</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Nova Venda
          </button>
        </div>
        <SalesList sales={sales || []} />
      </section>
    </div>
  );
}