"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

type DebtorRow = {
  id: string;
  name: string;
  email?: string | null;
  city?: string | null;
  state?: string | null;
};

export function DebtorList({ debtors }: { debtors: DebtorRow[] }) {
  if (!debtors || debtors.length === 0) {
    return (
      <EmptyState
        description="Nenhum comprador encontrado."
        variant="default"
      />
    );
  }

  return (
    <div className="space-y-2">
      {debtors.map((d) => (
        <div
          key={d.id}
          className="rounded-lg border border-border bg-surface p-3 flex items-center justify-between transition-colors hover:border-primary/30 hover:bg-surface-elevated/50"
        >
          <div>
            <div className="font-medium text-foreground">{d.name}</div>
            <div className="text-xs text-foreground-muted">
              {d.email} {d.city ? `• ${d.city}${d.state ? `/${d.state}` : ""}` : ""}
            </div>
          </div>
          <Link href={`/debtors/${d.id}`} className="text-primary hover:text-primary-hover transition-colors hover:underline">
            Ver perfil
          </Link>
        </div>
      ))}
    </div>
  );
}
