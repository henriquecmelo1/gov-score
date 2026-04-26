import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCompanyProfile, getCompanySales } from "@/lib/supabase/queries";
import { SalesSection } from "@/components/sales/sales-section"; // Novo componente
import { logoutAction } from "@/actions/logout";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  const [{ data: profile }, { data: sales }] = await Promise.all([
    getCompanyProfile(supabase, user.id),
    getCompanySales(supabase, user.id)
  ]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Perfil permanece estático/Server-side */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Perfil da Empresa</h1>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              Sair
            </button>
          </form>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p><strong>Razão Social:</strong> {profile?.razao_social}</p>
          <p><strong>CNPJ:</strong> {profile?.cnpj}</p>
          <p><strong>E-mail:</strong> {user.email}</p>
          <p><strong>Telefone:</strong> {profile?.telefone}</p>
        </div>
      </section>

      {/* Seção de Vendas com interatividade */}
      <SalesSection initialSales={sales || []} />
    </div>
  );
}