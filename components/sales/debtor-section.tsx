"use client";

import { Search } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import type { Debtor, DebtorCreateInput } from "@/lib/schemas/debtors";

function formatCNPJ(value: string) {
  const v = value.replace(/\D/g, "");
  return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5");
}

export { formatCNPJ };

type DebtorSectionProps = {
  debtors: Debtor[];
  cnpjSearch: string;
  isSearchingCnpj: boolean;
  isNewDebtor: boolean;
  newDebtorData: Partial<DebtorCreateInput>;
  lockedDebtorFields: Record<string, boolean>;
  selectedDebtor: Debtor | undefined;
  entidadeDevedoraError?: string;
  onCnpjChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewDebtorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  registerEntidadeDevedora: React.InputHTMLAttributes<HTMLInputElement>;
};

const inputBaseClass = `w-full p-2 border rounded-lg transition text-foreground bg-surface placeholder:text-foreground-dim focus:outline-none focus:ring-1`;
const inputNormalClass = `${inputBaseClass} border-border focus:border-primary/60 focus:ring-primary/30`;

export function DebtorSection({
  cnpjSearch,
  isSearchingCnpj,
  isNewDebtor,
  newDebtorData,
  lockedDebtorFields,
  selectedDebtor,
  entidadeDevedoraError,
  onCnpjChange,
  onNewDebtorChange,
  registerEntidadeDevedora,
}: DebtorSectionProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface-elevated p-4">
      <h4 className="text-sm font-medium text-foreground mb-4">
        Dados do Comprador
      </h4>

      <div className="space-y-4">
        <CnpjSearchField
          value={cnpjSearch}
          isSearching={isSearchingCnpj}
          onChange={onCnpjChange}
        />

        {isSearchingCnpj && (
          <p className="text-xs text-primary mt-1">Buscando informações do CNPJ...</p>
        )}

        {!isNewDebtor && selectedDebtor && (
          <SelectedDebtorIndicator name={selectedDebtor.name} />
        )}

        {isNewDebtor && (
          <NewDebtorForm
            data={newDebtorData}
            lockedFields={lockedDebtorFields}
            onChange={onNewDebtorChange}
          />
        )}

        <input type="hidden" {...registerEntidadeDevedora} />

        {entidadeDevedoraError && !isNewDebtor && (
          <p className="text-error text-xs mt-1">{entidadeDevedoraError}</p>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type CnpjSearchFieldProps = {
  value: string;
  isSearching: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function CnpjSearchField({ value, isSearching, onChange }: CnpjSearchFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground-muted mb-2">
        CNPJ do Comprador
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          className={`${inputNormalClass} pl-10`}
          placeholder="00.000.000/0000-00"
          maxLength={18}
        />
        <Search
          className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
            isSearching ? "text-primary animate-pulse" : "text-foreground-dim"
          }`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function SelectedDebtorIndicator({ name }: { name: string }) {
  return (
    <div className="text-sm text-success flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-success" />
      Comprador selecionado: {name}
    </div>
  );
}

type NewDebtorFormProps = {
  data: Partial<DebtorCreateInput>;
  lockedFields: Record<string, boolean>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function NewDebtorForm({ data, lockedFields, onChange }: NewDebtorFormProps) {
  const lockedClass = "opacity-70 cursor-not-allowed bg-surface/50";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
      <div className="md:col-span-2">
        <Alert>
          Novo CNPJ detectado. Verifique os dados abaixo para cadastrar o comprador automaticamente.
        </Alert>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground-muted mb-1">
          Razão Social *
        </label>
        <input
          name="name"
          value={data.name ?? ""}
          onChange={onChange}
          className={`${inputNormalClass} ${lockedFields.name ? lockedClass : ""}`}
          disabled={lockedFields.name}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground-muted mb-1">
          E-mail
        </label>
        <input
          name="email"
          type="email"
          value={data.email ?? ""}
          onChange={onChange}
          className={`${inputNormalClass} ${lockedFields.email ? lockedClass : ""}`}
          disabled={lockedFields.email}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground-muted mb-1">
          Telefone / Celular
        </label>
        <input
          name="phone"
          value={data.phone ?? ""}
          onChange={onChange}
          className={`${inputNormalClass} ${lockedFields.phone ? lockedClass : ""}`}
          disabled={lockedFields.phone}
          maxLength={15}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground-muted mb-1">
          Cidade / UF
        </label>
        <div className="flex gap-2">
          <input
            name="city"
            placeholder="Cidade"
            value={data.city ?? ""}
            onChange={onChange}
            className={`${inputNormalClass} !w-auto flex-1 min-w-0 ${lockedFields.city ? lockedClass : ""}`}
            disabled={lockedFields.city}
          />
          <input
            name="state"
            placeholder="UF"
            value={data.state ?? ""}
            onChange={onChange}
            className={`${inputNormalClass} !w-20 shrink-0 text-center uppercase ${lockedFields.state ? lockedClass : ""}`}
            maxLength={2}
            disabled={lockedFields.state}
          />
        </div>
      </div>
    </div>
  );
}