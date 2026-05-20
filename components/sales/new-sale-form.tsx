"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, FileText, Search, X } from "lucide-react";
import Link from "next/link";
import { saleSchema, type SaleInput } from "@/lib/schemas/inputs/sales";
import { createSaleAction, updateSaleAction } from "@/actions/sales";
import { createDebtorAction } from "@/actions/debtors";
import { fetchCnpjInfo } from "@/lib/services/cnpj";
import { formatCentsToBRL, normalizeBRLToDecimal } from "@/lib/formatters/input-formatters";
import { getFileNameFromUrl } from "@/lib/formatters";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Sale } from "@/lib/schemas/sales";
import type { Debtor, DebtorCreateInput } from "@/lib/schemas/debtors";

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

function formatCNPJ(value: string) {
  const v = value.replace(/\D/g, "");
  return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5");
}

export function NewSaleForm({
  onSuccess,
  sale,
  debtors,
}: SaleFormProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // CNPJ and new debtor state
  const [cnpjSearch, setCnpjSearch] = useState("");
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [isNewDebtor, setIsNewDebtor] = useState(false);
  const [newDebtorData, setNewDebtorData] = useState<Partial<DebtorCreateInput>>({
    name: "",
    email: "",
    cnpj: "",
    phone: "",
    city: "",
    state: "",
  });
  const [lockedDebtorFields, setLockedDebtorFields] = useState<Record<string, boolean>>({});

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
    watch,
  } = useForm<SaleInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: getDefaultValues(sale),
  });

  const selectedDebtorId = watch("entidade_devedora");
  const selectedDebtor = debtors.find(d => String(d.id) === String(selectedDebtorId));

  const nfFile = useWatch({ control, name: "nf_file" })?.[0];
  const contratoFile = useWatch({ control, name: "contrato_file" })?.[0];
  const nfDisplayName =
    nfFile?.name ?? (sale?.nf_url ? getFileNameFromUrl(sale.nf_url) : null);
  const contratoDisplayName =
    contratoFile?.name ??
    (sale?.contrato_url ? getFileNameFromUrl(sale.contrato_url) : null);

  useEffect(() => {
    reset(getDefaultValues(sale));
    if (sale) {
      const debtor = debtors.find(d => String(d.id) === String(sale.entidade_devedora));
      if (debtor?.cnpj) setCnpjSearch(formatCNPJ(debtor.cnpj));
    }
  }, [sale, reset, debtors]);

  const handleCnpjChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatCNPJ(rawValue);
    setCnpjSearch(formatted);

    const cleanCnpj = rawValue.replace(/\D/g, "");
    
    setIsNewDebtor(false);
    setValue("entidade_devedora", "", { shouldValidate: true });

    if (cleanCnpj.length === 14) {
      const existing = debtors.find(d => d.cnpj === cleanCnpj);
      if (existing) {
        setValue("entidade_devedora", String(existing.id), { shouldValidate: true });
        return;
      }

      setIsSearchingCnpj(true);
      try {
        const cnpjData = await fetchCnpjInfo(cleanCnpj);
        
        setIsNewDebtor(true);
        if (cnpjData) {
          setNewDebtorData({
            name: cnpjData.name,
            email: cnpjData.email,
            cnpj: cleanCnpj,
            phone: cnpjData.phone,
            city: cnpjData.city,
            state: cnpjData.state,
          });
          setLockedDebtorFields({
            name: !!cnpjData.name,
            email: !!cnpjData.email,
            phone: !!cnpjData.phone,
            city: !!cnpjData.city,
            state: !!cnpjData.state,
          });
        } else {
          // Not found or error, let user fill manually
          setNewDebtorData({ name: "", email: "", cnpj: cleanCnpj, phone: "", city: "", state: "" });
          setLockedDebtorFields({});
        }
        setValue("entidade_devedora", "NEW", { shouldValidate: true });
      } catch (err) {
        setIsNewDebtor(true);
        setNewDebtorData({ name: "", email: "", cnpj: cleanCnpj, phone: "", city: "", state: "" });
        setLockedDebtorFields({});
        setValue("entidade_devedora", "NEW", { shouldValidate: true });
      } finally {
        setIsSearchingCnpj(false);
      }
    }
  };

  const handleNewDebtorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDebtorData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (data: SaleInput) => {
    setLoading(true);
    setErrorMessage(null);

    let finalDebtorId = data.entidade_devedora;

    // Handle new debtor creation
    if (isNewDebtor && data.entidade_devedora === "NEW") {
      if (!newDebtorData.name) {
        setErrorMessage("A Razão Social do comprador é obrigatória.");
        setLoading(false);
        return;
      }

      const debtorResult = await createDebtorAction(newDebtorData as DebtorCreateInput);
      if (!debtorResult.success || !debtorResult.debtor) {
        setErrorMessage(debtorResult.error ?? "Erro ao cadastrar novo comprador.");
        setLoading(false);
        return;
      }
      finalDebtorId = String(debtorResult.debtor.id);
    }

    if (!finalDebtorId || finalDebtorId === "NEW") {
       setErrorMessage("Por favor, selecione ou preencha os dados de um comprador válido.");
       setLoading(false);
       return;
    }

    const formData = new FormData();
    if (sale) {
      formData.append("sale_id", sale.id);
    }
    formData.append("entidade_devedora", finalDebtorId);
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
      setCnpjSearch("");
      setIsNewDebtor(false);
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

      <div className="rounded-lg border border-border/60 bg-surface-elevated p-4">
        <h4 className="text-sm font-medium text-foreground mb-4">
          Dados do Comprador
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">
              CNPJ do Comprador
            </label>
            <div className="relative">
              <input
                type="text"
                value={cnpjSearch}
                onChange={handleCnpjChange}
                className={`${inputNormalClass} pl-10`}
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
              <Search
                className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isSearchingCnpj ? 'text-primary animate-pulse' : 'text-foreground-dim'}`}
                aria-hidden="true"
              />
            </div>
            {isSearchingCnpj && (
              <p className="text-xs text-primary mt-1">Buscando informações do CNPJ...</p>
            )}
            {!isNewDebtor && selectedDebtor && (
              <div className="mt-2 text-sm text-success flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success"></div>
                Comprador selecionado: {selectedDebtor.name}
              </div>
            )}
          </div>

          {/* New Debtor Inline Form */}
          {isNewDebtor && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
              <div className="md:col-span-2">
                <Alert className="mb-2">
                  Novo CNPJ detectado. Verifique os dados abaixo para cadastrar o comprador automaticamente.
                </Alert>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">Razão Social *</label>
                <input
                  name="name"
                  value={newDebtorData.name || ""}
                  onChange={handleNewDebtorChange}
                  className={`${inputNormalClass} ${lockedDebtorFields.name ? 'opacity-70 cursor-not-allowed bg-surface/50' : ''}`}
                  disabled={lockedDebtorFields.name}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">E-mail</label>
                <input
                  name="email"
                  type="email"
                  value={newDebtorData.email || ""}
                  onChange={handleNewDebtorChange}
                  className={`${inputNormalClass} ${lockedDebtorFields.email ? 'opacity-70 cursor-not-allowed bg-surface/50' : ''}`}
                  disabled={lockedDebtorFields.email}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">Telefone / Celular</label>
                <input
                  name="phone"
                  value={newDebtorData.phone || ""}
                  onChange={handleNewDebtorChange}
                  className={`${inputNormalClass} ${lockedDebtorFields.phone ? 'opacity-70 cursor-not-allowed bg-surface/50' : ''}`}
                  disabled={lockedDebtorFields.phone}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">Cidade / UF</label>
                <div className="flex gap-2">
                  <input
                    name="city"
                    placeholder="Cidade"
                    value={newDebtorData.city || ""}
                    onChange={handleNewDebtorChange}
                    className={`${inputNormalClass} !w-auto flex-1 min-w-0 ${lockedDebtorFields.city ? 'opacity-70 cursor-not-allowed bg-surface/50' : ''}`}
                    disabled={lockedDebtorFields.city}
                  />
                  <input
                    name="state"
                    placeholder="UF"
                    value={newDebtorData.state || ""}
                    onChange={handleNewDebtorChange}
                    className={`${inputNormalClass} !w-20 shrink-0 text-center uppercase ${lockedDebtorFields.state ? 'opacity-70 cursor-not-allowed bg-surface/50' : ''}`}
                    maxLength={2}
                    disabled={lockedDebtorFields.state}
                  />
                </div>
              </div>
            </div>
          )}

          <input
            type="hidden"
            {...register("entidade_devedora")}
          />
          {errors.entidade_devedora && !isNewDebtor && (
            <p className="text-error text-xs mt-1">
              {errors.entidade_devedora.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
