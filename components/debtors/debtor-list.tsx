"use client";

import Link from "next/link";

type DebtorRow = {
  id: string;
  name: string;
  email?: string | null;
  city?: string | null;
  state?: string | null;
};

export function DebtorList({ debtors }: { debtors: DebtorRow[] }) {
  if (!debtors || debtors.length === 0) {
    return <div className="text-gray-500">Nenhum devedor encontrado.</div>;
  }

  return (
    <div className="space-y-2">
      {debtors.map((d) => (
        <div key={d.id} className="rounded border p-3 bg-white flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-800">{d.name}</div>
            <div className="text-xs text-gray-500">{d.email} {d.city ? `• ${d.city}${d.state ? `/${d.state}` : ''}` : ''}</div>
          </div>
          <Link href={`/debtors/${d.id}`} className="text-blue-600 hover:underline">Ver perfil</Link>
        </div>
      ))}
    </div>
  );
}
