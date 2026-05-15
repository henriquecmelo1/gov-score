
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Users, Shield, Zap, Eye, ArrowRight } from "lucide-react";

const features = [
  {
    icon: LayoutGrid,
    title: "Mural de Transparência",
    description:
      "Consulte vendas e histórico de pagamentos de entidades públicas em tempo real.",
    href: "/mural",
    cta: "Acessar Mural",
  },
  {
    icon: Users,
    title: "Gestão de Compradores",
    description:
      "Cadastre e pesquise compradores do setor público. Acompanhe o histórico de cada entidade.",
    href: "/debtors",
    cta: "Ver Compradores",
  },
  {
    icon: Shield,
    title: "Perfil & Vendas",
    description:
      "Gerencie suas vendas, anexe documentos e acompanhe o status de cada transação.",
    href: "/profile",
    cta: "Ir para o Perfil",
  },
];

const stats = [
  {
    icon: Zap,
    label: "Acesso Gratuito",
    description: "Para os primeiros usuários",
  },
  {
    icon: Eye,
    label: "Transparência Total",
    description: "Dados abertos e verificáveis",
  },
  {
    icon: Shield,
    label: "Vendas Monitoradas",
    description: "Alertas de atraso automáticos",
  },
];

export default function Home() {
  return (
    <div className="relative">
      {/* Radial glow background effect */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />

      <div className="relative space-y-20 py-8">
        {/* ── Hero Section ── */}
        <section className="flex flex-col items-center text-center px-4 pt-12 pb-4">
          <div className="animate-float mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border-glow bg-surface/60 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
              <Zap className="h-3 w-3" />
              Fase inicial — acesso gratuito
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            <span className="gradient-text">GovScore</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-muted leading-relaxed">
            A plataforma que traz{" "}
            <span className="text-primary font-medium">transparência</span> e{" "}
            <span className="text-accent font-medium">segurança</span> para
            quem vende ao setor público. Monitore pagamentos, gerencie
            compradores e proteja seu negócio.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/mural">
              <Button variant="primary" size="lg">
                Explorar o Mural de Vendas
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" size="lg">
                Criar conta grátis
              </Button>
            </Link>
          </div>
        </section>

        {/* ── Feature Cards ── */}
        <section className="px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative rounded-xl border border-border bg-surface/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_30px_-5px_var(--primary-glow)] hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary-glow p-3 ring-1 ring-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>

                <p className="text-sm text-foreground-muted leading-relaxed mb-4">
                  {feature.description}
                </p>

                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:text-primary-hover transition-colors">
                  {feature.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Stats / Trust Indicators ── */}
        <section className="px-4">
          <div className="rounded-xl border border-border bg-surface/40 backdrop-blur-sm p-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-start gap-4">
                  <div className="shrink-0 rounded-lg bg-accent-glow p-2.5 ring-1 ring-accent/20">
                    <stat.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{stat.label}</p>
                    <p className="text-sm text-foreground-muted">
                      {stat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Bottom ── */}
        <section className="flex flex-col items-center text-center px-4 pb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Pronto para começar?
          </h2>
          <p className="text-foreground-muted mb-8 max-w-md">
            Cadastre-se gratuitamente e comece a monitorar suas vendas ao setor
            público hoje mesmo.
          </p>
          <Link href="/register">
            <Button variant="primary" size="lg" className="animate-pulse-glow">
              Criar conta grátis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
