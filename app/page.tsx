
import Link from "next/link";

export default function Home() {
  return (
    <section className="rounded-2xl border border-secondary bg-white p-10 text-center shadow-sm">
      <h1 className="text-4xl font-bold tracking-tight text-primary">Bem-vindo ao GovScore</h1>
      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
        Plataforma para acompanhar vendas e pagamentos com transparencia, em uma interface limpa e objetiva.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/mural"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white! transition hover:bg-primary-700"
        >
          Ir para o Mural
        </Link>
        <Link
          href="/profile"
          className="rounded-md border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary-50"
        >
          Ir para o Perfil
        </Link>
      </div>
    </section>
  );
}
