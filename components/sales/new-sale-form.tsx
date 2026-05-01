"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, FileText, X } from "lucide-react";
import Link from "next/link";
import { saleSchema, type SaleInput } from "@/lib/schemas/inputs/sales";
import { createSaleAction, updateSaleAction } from "@/actions/sales";
import type { Sale } from "@/lib/schemas/sales";
import { getFileNameFromUrl } from "@/lib/formatters";
import type { Debtor } from "@/lib/schemas/debtors";

type SaleFormProps = {
  onSuccess: (mode: "create" | "update") => void;
  sale?: Sale | null;
  debtors: Debtor[];
};

function formatCentsToBRL(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  const value = Number(digits) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function normalizeBRLToDecimal(maskedValue: string): string {
  const digits = maskedValue.replace(/\D/g, "");
  if (!digits) return "0.00";

  const value = Number(digits) / 100;
  return value.toFixed(2);
}

function getDefaultValues(sale?: Sale | null): SaleInput {
  const saleValue = sale?.valor_nf != null ? String(sale.valor_nf) : "";
  const initialValorNf = saleValue ? formatCentsToBRL(saleValue.replace(/[.,]/g, "")) : "";

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
  return `${debtor.name} ${debtor.email ?? ""} ${debtor.city ?? ""} ${debtor.state ?? ""}`.trim();
}

function getDebtorLabelFromSale(sale: Sale | null | undefined, debtors: Debtor[]) {
  if (!sale?.entidade_devedora) return "";

  const saleDebtorId = String(sale.entidade_devedora);
  const matchedDebtor = debtors.find((debtor) => String(debtor.id) === saleDebtorId);
  if (matchedDebtor) return debtorOptionLabel(matchedDebtor);

  return saleDebtorId;
}

export function NewSaleForm({ onSuccess, sale, debtors }: SaleFormProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debtorSearch, setDebtorSearch] = useState(() => getDebtorLabelFromSale(sale, debtors));
  const [isDebtorOpen, setIsDebtorOpen] = useState(false);
  const [nfInputKey, setNfInputKey] = useState(0);
  const [contratoInputKey, setContratoInputKey] = useState(0);
  const isEditing = Boolean(sale);
  const { register, handleSubmit, formState: { errors }, reset, control, setValue } = useForm<SaleInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: getDefaultValues(sale),
  });
  const nfFile = useWatch({ control, name: "nf_file" })?.[0];
  const contratoFile = useWatch({ control, name: "contrato_file" })?.[0];
  const nfDisplayName = nfFile?.name ?? (sale?.nf_url ? getFileNameFromUrl(sale.nf_url) : null);
  const contratoDisplayName = contratoFile?.name ?? (sale?.contrato_url ? getFileNameFromUrl(sale.contrato_url) : null);
  const filteredDebtors = useMemo(() => {
    const term = debtorSearch.trim().toLowerCase();

    if (!term) return debtors;

    return debtors.filter((debtor) => debtorOptionSearchText(debtor).toLowerCase().includes(term));
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

    const result = sale ? await updateSaleAction(formData) : await createSaleAction(formData);
    
    if (result.success) {
      reset(getDefaultValues(null));
      onSuccess(sale ? "update" : "create");
    } else {
      setErrorMessage(result.error ?? "Não foi possível salvar a venda.");
    }
    setLoading(false);
  };

  const onInvalid = () => {
    setErrorMessage("Revise os campos obrigatórios destacados em vermelho.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Editar Venda" : "Cadastrar Nova Venda"}
          </h3>
          {isEditing && (
            <p className="mt-1 text-sm text-gray-600">
              Você pode alterar os dados abaixo e substituir os arquivos se necessário.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Cliente</label>
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

                const selectedDebtor = debtors.find((debtor) => debtorOptionLabel(debtor) === searchValue);
                setValue("entidade_devedora", selectedDebtor ? String(selectedDebtor.id) : "", {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Digite para buscar cliente"
              autoComplete="off"
              role="combobox"
              aria-expanded={isDebtorOpen}
              aria-controls="debtors-options"
            />
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />

            {isDebtorOpen && filteredDebtors.length > 0 && (
              <div id="debtors-options" className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
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
                      className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left transition hover:bg-blue-50"
                    >
                      <span className="text-sm font-medium text-gray-900">{debtor.name}</span>
                      <span className="text-xs text-gray-500">
                        {debtor.email ?? "Sem e-mail"}
                        {(debtor.city || debtor.state) ? ` • ${debtor.city ?? ""}${debtor.city && debtor.state ? "/" : ""}${debtor.state ?? ""}` : ""}
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
              className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
            >
              Adicionar Cliente
            </Link>
          </div>
          <input type="hidden" {...register("entidade_devedora")} />
          {errors.entidade_devedora && <p className="text-red-500 text-xs">{errors.entidade_devedora.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Valor da NF (R$)</label>
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
                className="w-full p-2 border rounded border-gray-400 bg-white text-gray-900"
                placeholder="R$ 0,00"
              />
            )}
          />
          {errors.valor_nf && <p className="text-red-500 text-xs">{errors.valor_nf.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Número da Ordem</label>
          <input {...register("numero_ordem")} className="w-full p-2 border rounded border-gray-400 bg-white text-gray-900" />
          {errors.numero_ordem && <p className="text-red-500 text-xs">{errors.numero_ordem.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Data de Entrega</label>
          <input type="date" {...register("data_entrega")} className="w-full p-2 border rounded border-gray-400 bg-white text-gray-900" />
          {errors.data_entrega && <p className="text-red-500 text-xs">{errors.data_entrega.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Itens e Quantidades</label>
        <textarea {...register("itens_quantidade")} className="w-full p-2 border rounded border-gray-400 bg-white text-gray-900" rows={3} placeholder="Descreva os produtos/serviços..." />
        {errors.itens_quantidade && <p className="text-red-500 text-xs">{errors.itens_quantidade.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nota Fiscal (PDF)</label>
          <label className="mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50 px-4 py-5 text-center transition hover:border-blue-500 hover:bg-blue-100">
            {nfDisplayName ? (
              <>
                <div className="flex w-full max-w-xs items-center gap-3 rounded-md border border-blue-200 bg-white px-3 py-2 text-left shadow-sm">
                  <div className="rounded-md bg-red-100 p-2">
                    <FileText className="h-5 w-5 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{nfDisplayName}</p>
                    <p className="text-xs text-gray-500">Documento PDF</p>
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
                      className="ml-auto rounded p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Remover nota fiscal selecionada"
                      title="Remover arquivo"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <span className="text-xs text-blue-800/80">Clique para substituir o arquivo</span>
              </>
            ) : (
              <>
                <FileText className="h-6 w-6 text-blue-700" aria-hidden="true" />
                <span className="text-sm font-medium text-blue-900">Selecionar Nota Fiscal</span>
                <span className="text-xs text-blue-800/80">Clique para anexar um PDF</span>
              </>
            )}
            <input key={nfInputKey} type="file" {...register("nf_file")} className="sr-only" accept=".pdf" />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contrato (PDF)</label>
          <label className="mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50 px-4 py-5 text-center transition hover:border-blue-500 hover:bg-blue-100">
            {contratoDisplayName ? (
              <>
                <div className="flex w-full max-w-xs items-center gap-3 rounded-md border border-blue-200 bg-white px-3 py-2 text-left shadow-sm">
                  <div className="rounded-md bg-red-100 p-2">
                    <FileText className="h-5 w-5 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{contratoDisplayName}</p>
                    <p className="text-xs text-gray-500">Documento PDF</p>
                  </div>
                  {contratoFile && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setValue("contrato_file", undefined, { shouldDirty: true });
                        setContratoInputKey((value) => value + 1);
                      }}
                      className="ml-auto rounded p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Remover contrato selecionado"
                      title="Remover arquivo"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <span className="text-xs text-blue-800/80">Clique para substituir o arquivo</span>
              </>
            ) : (
              <>
                <FileText className="h-6 w-6 text-blue-700" aria-hidden="true" />
                <span className="text-sm font-medium text-blue-900">Selecionar Contrato</span>
                <span className="text-xs text-blue-800/80">Clique para anexar um PDF</span>
              </>
            )}
            <input key={contratoInputKey} type="file" {...register("contrato_file")} className="sr-only" accept=".pdf" />
          </label>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400">
        {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Venda"}
      </button>
    </form>
  );
}