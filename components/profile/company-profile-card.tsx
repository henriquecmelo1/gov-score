import { logoutAction } from "@/actions/logout";

type CompanyProfileCardProps = {
  razaoSocial?: string | null;
  cnpj?: string | null;
  email?: string | null;
  telefone?: string | null;
};

export function CompanyProfileCard({ razaoSocial, cnpj, email, telefone }: CompanyProfileCardProps) {
  return (
    <section className="rounded-xl border border-border-glow bg-surface p-6 shadow-lg glow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Perfil da Empresa</h1>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg border border-error/30 bg-error/10 px-4 py-2 text-sm font-semibold text-error transition hover:bg-error/20 hover:border-error/50"
          >
            Sair
          </button>
        </form>
      </div>
      <div className="grid grid-cols-1 gap-4 text-foreground-muted md:grid-cols-2">
        <p><strong className="text-foreground">Razão Social:</strong> {razaoSocial ?? "-"}</p>
        <p><strong className="text-foreground">CNPJ:</strong> {cnpj ?? "-"}</p>
        <p><strong className="text-foreground">E-mail:</strong> {email ?? "-"}</p>
        <p><strong className="text-foreground">Telefone:</strong> {telefone ?? "-"}</p>
      </div>
    </section>
  );
}
