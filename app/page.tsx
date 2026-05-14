
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="rounded-2xl border border-secondary bg-white p-10 text-center shadow-sm">
      <h1 className="text-4xl font-bold tracking-tight text-primary">Bem-vindo ao GovScore</h1>
      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
        O GovScore está em fase inicial e, por isso, oferece acesso gratuito para os primeiros usuários que desejam vender com mais segurança ao setor público.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/mural">
          <Button variant="primary" size="md">
            Ir para o Mural
          </Button>
        </Link>
        <Link href="/debtors">
          <Button variant="secondary" size="md">
            Ir para página de Compradores
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="secondary" size="md">
            Ir para o Perfil
          </Button>
        </Link>
      </div>
    </section>
  );
}
