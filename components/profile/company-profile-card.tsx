import { logoutAction } from "@/actions/logout";

type CompanyProfileCardProps = {
  razaoSocial?: string | null;
  cnpj?: string | null;
  email?: string | null;
  telefone?: string | null;
};

export function CompanyProfileCard({ razaoSocial, cnpj, email, telefone }: CompanyProfileCardProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
      <div className="grid grid-cols-1 gap-4 text-gray-700 md:grid-cols-2">
        <p><strong>Razão Social:</strong> {razaoSocial ?? "-"}</p>
        <p><strong>CNPJ:</strong> {cnpj ?? "-"}</p>
        <p><strong>E-mail:</strong> {email ?? "-"}</p>
        <p><strong>Telefone:</strong> {telefone ?? "-"}</p>
      </div>
    </section>
  );
}
