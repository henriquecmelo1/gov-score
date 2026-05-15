"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, FileText, X } from "lucide-react";
import Link from "next/link";
import { saleSchema, type SaleInput } from "@/lib/schemas/inputs/sales";
import { createSaleAction, updateSaleAction } from "@/actions/sales";
import { formatCentsToBRL, normalizeBRLToDecimal } from "@/lib/formatters/input-formatters";
import { getFileNameFromUrl } from "@/lib/formatters";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Sale } from "@/lib/schemas/sales";
import type { Debtor } from "@/lib/schemas/debtors";

type SaleFormProps = {
  onSuccess: (mode: "create" | "update") => void;
  sale?: Sale | null;
  debtors: Debtor[];
};

function getDefaultValues(sale?: Sale | null): SaleInput {
  const saleValue = sale?.valor_nf != null ? String(sale.valor_nf) : "";
  const initialValorNf = saleValue
    ? formatCentsToBRL(saleValue.replace(/[.,]/g, ""))
    : "";

  return {
    entidade_devedora: sale?.entidade_devedora ?? "",
    valor_nf: initialValorNf,
    data_entrega: sale ? sale.data_entrega.slice(0, 10) : "",
    numero_ordem: sale?.numero_ordem ?? "",
    itens_quantidade: sale?.itens_quantidade ?? "",
    nf_file: undefined,
    contrato_file: undefined,
  };
}

function debtorOptionLabel(debtor: Debtor) {
  const emailPart = debtor.email ? ` - ${debtor.email}` : "";
  return `${debtor.name}${emailPart}`;
}

function debtorOptionSearchText(debtor: Debtor) {
  return `${debtor.name} ${debtor.email ?? ""} ${debtor.city ?? ""} ${debtor.state ?? ""
    }`.trim();
}

function getDebtorLabelFromSale(
  sale: Sale | null | undefined,
  debtors: Debtor[]
) {
  if (!sale?.entidade_devedora) return "";

  const saleDebtorId = String(sale.entidade_devedora);
  const matchedDebtor = debtors.find(
    (debtor) => String(debtor.id) === saleDebtorId
  );
  if (matchedDebtor) return debtorOptionLabel(matchedDebtor);

  return saleDebtorId;
}

export function NewSaleForm({
  onSuccess,
  sale,
  debtors,
}: SaleFormProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debtorSearch, setDebtorSearch] = useState(() =>
    getDebtorLabelFromSale(sale, debtors)
  );
  const [isDebtorOpen, setIsDebtorOpen] = useState(false);
  const [nfInputKey, setNfInputKey] = useState(0);
  const [contratoInputKey, setContratoInputKey] = useState(0);
  const isEditing = Boolean(sale);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<SaleInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: getDefaultValues(sale),
  });

  const nfFile = useWatch({ control, name: "nf_file" })?.[0];
  const contratoFile = useWatch({ control, name: "contrato_file" })?.[0];
  const nfDisplayName =
    nfFile?.name ?? (sale?.nf_url ? getFileNameFromUrl(sale.nf_url) : null);
  const contratoDisplayName =
    contratoFile?.name ??
    (sale?.contrato_url ? getFileNameFromUrl(sale.contrato_url) : null);

  const filteredDebtors = useMemo(() => {
    const term = debtorSearch.trim().toLowerCase();

    if (!term) return debtors;

    return debtors.filter((debtor) =>
      debtorOptionSearchText(debtor).toLowerCase().includes(term)
    );
  }, [debtors, debtorSearch]);

  useEffect(() => {
    reset(getDefaultValues(sale));
  }, [sale, reset]);

  const onSubmit = async (data: SaleInput) => {
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    if (sale) {
      formData.append("sale_id", sale.id);
    }
    formData.append("entidade_devedora", data.entidade_devedora);
    formData.append("valor_nf", normalizeBRLToDecimal(data.valor_nf));
    formData.append("data_entrega", data.data_entrega);
    formData.append("numero_ordem", data.numero_ordem);
    formData.append("itens_quantidade", data.itens_quantidade);

    const nfFile = data.nf_file?.[0];
    const contratoFile = data.contrato_file?.[0];
    if (nfFile) formData.append("nf_file", nfFile);
    if (contratoFile) formData.append("contrato_file", contratoFile);

    const result = sale
      ? await updateSaleAction(formData)
      : await createSaleAction(formData);

    if (result.success) {
      reset(getDefaultValues(null));
      onSuccess(sale ? "update" : "create");
    } else {
      setErrorMessage(result.error ?? "Não foi possível salvar a venda.");
    }
    setLoading(false);
  };

  const onInvalid = () => {
    setErrorMessage(
      "Revise os campos obrigatórios destacados em vermelho."
    );
  };

  const inputBaseClass = `w-full p-2 border rounded-lg transition text-foreground bg-surface placeholder:text-foreground-dim focus:outline-none focus:ring-1`;
  const inputNormalClass = `${inputBaseClass} border-border focus:border-primary/60 focus:ring-primary/30`;
  const inputErrorClass = `${inputBaseClass} border-error/50 focus:border-error focus:ring-error/50`;

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-4 rounded-xl border border-border bg-surface p-6"
    >
      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {isEditing ? "Editar Venda" : "Cadastrar Nova Venda"}
          </h3>
          {isEditing && (
            <p className="mt-1 text-sm text-foreground-muted">
              Você pode alterar os dados abaixo e substituir os arquivos se
              necessário.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            Comprador
          </label>
          <div className="relative">
            <input
              type="text"
              value={debtorSearch}
              onFocus={() => setIsDebtorOpen(true)}
              onBlur={() => {
                setTimeout(() => setIsDebtorOpen(false), 120);
              }}
              onChange={(event) => {
                const searchValue = event.target.value;
                setDebtorSearch(searchValue);
                setIsDebtorOpen(true);

                const selectedDebtor = debtors.find(
                  (debtor) => debtorOptionLabel(debtor) === searchValue
                );
                setValue(
                  "entidade_devedora",
                  selectedDebtor ? String(selectedDebtor.id) : "",
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  }
                );
              }}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 pr-10 text-foreground shadow-sm outline-none transition placeholder:text-foreground-dim focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
              placeholder="Digite para buscar comprador"
              autoComplete="off"
              role="combobox"
              aria-expanded={isDebtorOpen}
              aria-controls="debtors-options"
            />
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-dim"
              aria-hidden="true"
            />

            {isDebtorOpen && filteredDebtors.length > 0 && (
              <div
                id="debtors-options"
                className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-surface-elevated py-1 shadow-lg"
              >
                {filteredDebtors.map((debtor) => {
                  const label = debtorOptionLabel(debtor);

                  return (
                    <button
                      key={debtor.id}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        setDebtorSearch(label);
                        setValue("entidade_devedora", String(debtor.id), {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        setIsDebtorOpen(false);
                      }}
                      className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left transition hover:bg-primary-glow"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {debtor.name}
                      </span>
                      <span className="text-xs text-foreground-muted">
                        {debtor.email ?? "Sem e-mail"}
                        {debtor.city || debtor.state
                          ? ` • ${debtor.city ?? ""}${debtor.city && debtor.state ? "/" : ""
                          }${debtor.state ?? ""}`
                          : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="mt-2">
            <Link
              href="/debtors"
              className="inline-flex items-center rounded-lg border border-primary/30 bg-primary-glow px-3 py-1.5 text-xs font-medium text-primary transition hover:border-primary/50 hover:bg-primary/20"
            >
              Adicionar Comprador
            </Link>
          </div>
          <input
            type="hidden"
            {...register("entidade_devedora")}
          />
          {errors.entidade_devedora && (
            <p className="text-error text-xs mt-1">
              {errors.entidade_devedora.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            Valor da NF (R$)
          </label>
          <Controller
            control={control}
            name="valor_nf"
            render={({ field }) => (
              <input
                type="text"
                inputMode="numeric"
                value={field.value ?? ""}
                onChange={(event) => {
                  field.onChange(formatCentsToBRL(event.target.value));
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                className={errors.valor_nf ? inputErrorClass : inputNormalClass}
                placeholder="R$ 0,00"
              />
            )}
          />
          {errors.valor_nf && (
            <p className="text-error text-xs mt-1">
              {errors.valor_nf.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            Número da Ordem
          </label>
          <input
            {...register("numero_ordem")}
            className={errors.numero_ordem ? inputErrorClass : inputNormalClass}
          />
          {errors.numero_ordem && (
            <p className="text-error text-xs mt-1">
              {errors.numero_ordem.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            Data de Entrega
          </label>
          <input
            type="date"
            {...register("data_entrega")}
            className={errors.data_entrega ? inputErrorClass : inputNormalClass}
          />
          {errors.data_entrega && (
            <p className="text-error text-xs mt-1">
              {errors.data_entrega.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground-muted mb-2">
          Itens e Quantidades
        </label>
        <textarea
          {...register("itens_quantidade")}
          className={`${errors.itens_quantidade ? inputErrorClass : inputNormalClass} resize-y`}
          rows={3}
          placeholder="Descreva os produtos/serviços..."
        />
        {errors.itens_quantidade && (
          <p className="text-error text-xs mt-1">
            {errors.itens_quantidade.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            Nota Fiscal (PDF)
          </label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary-glow px-4 py-5 text-center transition hover:border-primary/50 hover:bg-primary/15">
            {nfDisplayName ? (
              <>
                <div className="flex w-full max-w-xs items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-left shadow-sm">
                  <div className="rounded-lg bg-error/20 p-2">
                    <FileText
                      className="h-5 w-5 text-error"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {nfDisplayName}
                    </p>
                    <p className="text-xs text-foreground-dim">Documento PDF</p>
                  </div>
                  {nfFile && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setValue("nf_file", undefined, { shouldDirty: true });
                        setNfInputKey((value) => value + 1);
                      }}
                      className="ml-auto rounded p-1 text-foreground-dim transition hover:bg-surface-elevated hover:text-foreground"
                      aria-label="Remover nota fiscal selecionada"
                      title="Remover arquivo"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <span className="text-xs text-primary/70">
                  Clique para substituir o arquivo
                </span>
              </>
            ) : (
              <>
                <FileText
                  className="h-6 w-6 text-primary"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-primary">
                  Selecionar Nota Fiscal
                </span>
                <span className="text-xs text-primary/70">
                  Clique para anexar um PDF
                </span>
              </>
            )}
            <input
              key={nfInputKey}
              type="file"
              {...register("nf_file")}
              className="sr-only"
              accept=".pdf"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            Contrato (PDF)
          </label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary-glow px-4 py-5 text-center transition hover:border-primary/50 hover:bg-primary/15">
            {contratoDisplayName ? (
              <>
                <div className="flex w-full max-w-xs items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-left shadow-sm">
                  <div className="rounded-lg bg-error/20 p-2">
                    <FileText
                      className="h-5 w-5 text-error"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {contratoDisplayName}
                    </p>
                    <p className="text-xs text-foreground-dim">Documento PDF</p>
                  </div>
                  {contratoFile && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setValue("contrato_file", undefined, {
                          shouldDirty: true,
                        });
                        setContratoInputKey((value) => value + 1);
                      }}
                      className="ml-auto rounded p-1 text-foreground-dim transition hover:bg-surface-elevated hover:text-foreground"
                      aria-label="Remover contrato selecionado"
                      title="Remover arquivo"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <span className="text-xs text-primary/70">
                  Clique para substituir o arquivo
                </span>
              </>
            ) : (
              <>
                <FileText
                  className="h-6 w-6 text-primary"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-primary">
                  Selecionar Contrato
                </span>
                <span className="text-xs text-primary/70">
                  Clique para anexar um PDF
                </span>
              </>
            )}
            <input
              key={contratoInputKey}
              type="file"
              {...register("contrato_file")}
              className="sr-only"
              accept=".pdf"
            />
          </label>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={loading}
        className="w-full"
      >
        {isEditing ? "Salvar Alterações" : "Cadastrar Venda"}
      </Button>
    </form>
  );
}
