"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, X } from "lucide-react";
import { saleSchema, type SaleInput } from "@/lib/schemas/inputs/sales";
import { createSaleAction, updateSaleAction } from "@/actions/sales";
import { createDebtorAction } from "@/actions/debtors";
import { fetchCnpjInfo } from "@/lib/services/cnpj";
import { formatCentsToBRL, formatPhone, normalizeBRLToDecimal } from "@/lib/formatters/input-formatters";
import { getFileNameFromUrl } from "@/lib/formatters";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DebtorSection, formatCNPJ } from "./debtor-section";
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
    entidade_devedora: sale?.entidade_devedora != null ? String(sale.entidade_devedora) : "",
    valor_nf: initialValorNf,
    data_entrega: sale ? sale.data_entrega.slice(0, 10) : "",
    numero_ordem: sale?.numero_ordem ?? "",
    itens_quantidade: sale?.itens_quantidade ?? "",
    numero_contrato: sale?.numero_contrato ?? "",
    numero_nota_empenho: sale?.numero_nota_empenho ?? "",
    alternative_email: sale?.alternative_email ?? "",
    nf_file: undefined,
    contrato_file: undefined,
  };
}

export function NewSaleForm({ onSuccess, sale, debtors }: SaleFormProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debtor state
  const [cnpjSearch, setCnpjSearch] = useState("");
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [isNewDebtor, setIsNewDebtor] = useState(false);
  const [newDebtorData, setNewDebtorData] = useState<Partial<DebtorCreateInput>>({
    name: "", email: "", cnpj: "", phone: "", city: "", state: "",
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
    setError,
    watch,
  } = useForm<SaleInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: getDefaultValues(sale),
  });

  const selectedDebtorId = watch("entidade_devedora");
  const selectedDebtor = debtors.find(d => String(d.id) === String(selectedDebtorId));

  const nfFile = useWatch({ control, name: "nf_file" })?.[0];
  const contratoFile = useWatch({ control, name: "contrato_file" })?.[0];
  const nfDisplayName = nfFile?.name ?? (sale?.nf_url ? getFileNameFromUrl(sale.nf_url) : null);
  const contratoDisplayName = contratoFile?.name ?? (sale?.contrato_url ? getFileNameFromUrl(sale.contrato_url) : null);

  useEffect(() => {
    reset(getDefaultValues(sale));
    if (sale) {
      const debtor = debtors.find(d => String(d.id) === String(sale.entidade_devedora));
      if (debtor?.cnpj) setCnpjSearch(formatCNPJ(debtor.cnpj));
    }
  }, [sale, reset, debtors]);

  const handleCnpjChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setCnpjSearch(formatted);

    const cleanCnpj = e.target.value.replace(/\D/g, "");
    setIsNewDebtor(false);
    setValue("entidade_devedora", "", { shouldValidate: true });

    if (cleanCnpj.length !== 14) return;

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
          name: cnpjData.name, email: cnpjData.email, cnpj: cleanCnpj,
          phone: cnpjData.phone, city: cnpjData.city, state: cnpjData.state,
        });
        setLockedDebtorFields({
          name: !!cnpjData.name, email: !!cnpjData.email, phone: !!cnpjData.phone,
          city: !!cnpjData.city, state: !!cnpjData.state,
        });
      } else {
        setNewDebtorData({ name: "", email: "", cnpj: cleanCnpj, phone: "", city: "", state: "" });
        setLockedDebtorFields({});
      }
      setValue("entidade_devedora", "NEW", { shouldValidate: true });
    } catch {
      setIsNewDebtor(true);
      setNewDebtorData({ name: "", email: "", cnpj: cleanCnpj, phone: "", city: "", state: "" });
      setLockedDebtorFields({});
      setValue("entidade_devedora", "NEW", { shouldValidate: true });
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  const handleNewDebtorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const finalValue = name === "phone" ? formatPhone(value) : value;
    setNewDebtorData(prev => ({ ...prev, [name]: finalValue }));
  };

  const onSubmit = async (data: SaleInput) => {
    console.log("Form onSubmit called with:", data);
    setLoading(true);
    setErrorMessage(null);

    const debtorEmail = isNewDebtor
      ? newDebtorData.email?.trim() ?? ""
      : selectedDebtor?.email?.trim() ?? "";

    if (!debtorEmail && !data.alternative_email?.trim()) {
      setError("alternative_email", {
        type: "manual",
        message: "O e-mail do comprador ou o e-mail alternativo deve ser preenchido.",
      });
      setErrorMessage("O e-mail do comprador ou o e-mail alternativo deve ser preenchido.");
      setLoading(false);
      return;
    }

    try {
      let finalDebtorId = data.entidade_devedora;

      if (isNewDebtor && data.entidade_devedora === "NEW") {
        if (!newDebtorData.name) {
          setErrorMessage("A Razão Social do comprador é obrigatória.");
          setLoading(false);
          return;
        }

        const debtorResult = await createDebtorAction(newDebtorData as DebtorCreateInput);
        console.log("createDebtorAction result:", debtorResult);
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
      if (sale) formData.append("sale_id", sale.id);
      formData.append("entidade_devedora", finalDebtorId);
      formData.append("valor_nf", normalizeBRLToDecimal(data.valor_nf));
      formData.append("data_entrega", data.data_entrega);
      formData.append("numero_ordem", data.numero_ordem);
      formData.append("numero_contrato", data.numero_contrato ?? "");
      formData.append("numero_nota_empenho", data.numero_nota_empenho ?? "");
      formData.append("alternative_email", data.alternative_email ?? "");
      formData.append("itens_quantidade", data.itens_quantidade);

      const nfFile = data.nf_file?.[0];
      const contratoFile = data.contrato_file?.[0];
      if (nfFile) formData.append("nf_file", nfFile);
      if (contratoFile) formData.append("contrato_file", contratoFile);

      console.log("Submitting formData with sale:", sale?.id);
      const result = sale
        ? await updateSaleAction(formData)
        : await createSaleAction(formData);
      console.log("Action result:", result);

      if (result.success) {
        reset(getDefaultValues(null));
        setCnpjSearch("");
        setIsNewDebtor(false);
        onSuccess(sale ? "update" : "create");
      } else {
        setErrorMessage(result.error ?? "Não foi possível salvar a venda.");
      }
    } catch (err: any) {
      console.error("Uncaught submission error:", err);
      setErrorMessage(err?.message ?? "Ocorreu um erro inesperado ao salvar a venda.");
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (formErrors: any) => {
    console.warn("Form validation failed with errors:", formErrors);
    const errorList = Object.entries(formErrors)
      .map(([key, err]: any) => {
        const fieldName = 
          key === "entidade_devedora" ? "Comprador" :
          key === "itens_quantidade" ? "Itens e Quantidades" :
          key === "valor_nf" ? "Valor da NF" :
          key === "data_entrega" ? "Data de Entrega" :
          key === "numero_ordem" ? "Número da Ordem" :
          key === "numero_contrato" ? "Número do Contrato" :
          key === "numero_nota_empenho" ? "Nº da Nota de Empenho" :
          key === "alternative_email" ? "E-mail Alternativo" : key;
        return `${fieldName}: ${err?.message || "campo inválido"}`;
      });
    
    if (errorList.length > 0) {
      setErrorMessage(`Por favor, corrija os seguintes erros: ${errorList.join(" | ")}`);
    } else {
      setErrorMessage("Revise os campos obrigatórios destacados em vermelho.");
    }
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
              Você pode alterar os dados abaixo e substituir os arquivos se necessário.
            </p>
          )}
        </div>
      </div>

      <DebtorSection
        debtors={debtors}
        cnpjSearch={cnpjSearch}
        isSearchingCnpj={isSearchingCnpj}
        isNewDebtor={isNewDebtor}
        newDebtorData={newDebtorData}
        lockedDebtorFields={lockedDebtorFields}
        selectedDebtor={selectedDebtor}
        entidadeDevedoraError={errors.entidade_devedora?.message}
        onCnpjChange={handleCnpjChange}
        onNewDebtorChange={handleNewDebtorChange}
        registerEntidadeDevedora={register("entidade_devedora")}
      />

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
                onChange={(e) => field.onChange(formatCentsToBRL(e.target.value))}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                className={errors.valor_nf ? inputErrorClass : inputNormalClass}
                placeholder="R$ 0,00"
              />
            )}
          />
          {errors.valor_nf && (
            <p className="text-error text-xs mt-1">{errors.valor_nf.message}</p>
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
            <p className="text-error text-xs mt-1">{errors.numero_ordem.message}</p>
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
            <p className="text-error text-xs mt-1">{errors.data_entrega.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            Número do Contrato
          </label>
          <input
            {...register("numero_contrato")}
            className={errors.numero_contrato ? inputErrorClass : inputNormalClass}
          />
          {errors.numero_contrato && (
            <p className="text-error text-xs mt-1">{errors.numero_contrato.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            Nº da Nota de Empenho
          </label>
          <input
            {...register("numero_nota_empenho")}
            className={errors.numero_nota_empenho ? inputErrorClass : inputNormalClass}
          />
          {errors.numero_nota_empenho && (
            <p className="text-error text-xs mt-1">{errors.numero_nota_empenho.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            E‑mail Alternativo (Opcional)
          </label>
          <input
            {...register("alternative_email")}
            className={errors.alternative_email ? inputErrorClass : inputNormalClass}
          />
          {errors.alternative_email && (
            <p className="text-error text-xs mt-1">{errors.alternative_email.message}</p>
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
          <p className="text-error text-xs mt-1">{errors.itens_quantidade.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUploadField
          label="Nota Fiscal (PDF)"
          displayName={nfDisplayName}
          hasNewFile={!!nfFile}
          onClear={() => {
            setValue("nf_file", undefined, { shouldDirty: true });
            setNfInputKey(k => k + 1);
          }}
          clearAriaLabel="Remover nota fiscal selecionada"
          inputKey={nfInputKey}
          inputProps={register("nf_file")}
        />
        <FileUploadField
          label="Contrato (PDF)"
          displayName={contratoDisplayName}
          hasNewFile={!!contratoFile}
          onClear={() => {
            setValue("contrato_file", undefined, { shouldDirty: true });
            setContratoInputKey(k => k + 1);
          }}
          clearAriaLabel="Remover contrato selecionado"
          inputKey={contratoInputKey}
          inputProps={register("contrato_file")}
        />
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

// ─── FileUploadField ──────────────────────────────────────────────────────────

type FileUploadFieldProps = {
  label: string;
  displayName: string | null | undefined;
  hasNewFile: boolean;
  onClear: () => void;
  clearAriaLabel: string;
  inputKey: number;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
};

function FileUploadField({
  label,
  displayName,
  hasNewFile,
  onClear,
  clearAriaLabel,
  inputKey,
  inputProps,
}: FileUploadFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground-muted mb-2">
        {label}
      </label>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary-glow px-4 py-5 text-center transition hover:border-primary/50 hover:bg-primary/15">
        {displayName ? (
          <>
            <div className="flex w-full max-w-xs items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-left shadow-sm">
              <div className="rounded-lg bg-error/20 p-2">
                <FileText className="h-5 w-5 text-error" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                <p className="text-xs text-foreground-dim">Documento PDF</p>
              </div>
              {hasNewFile && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClear(); }}
                  className="ml-auto rounded p-1 text-foreground-dim transition hover:bg-surface-elevated hover:text-foreground"
                  aria-label={clearAriaLabel}
                  title="Remover arquivo"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <span className="text-xs text-primary/70">Clique para substituir o arquivo</span>
          </>
        ) : (
          <>
            <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-primary">Selecionar {label}</span>
            <span className="text-xs text-primary/70">Clique para anexar um PDF</span>
          </>
        )}
        <input key={inputKey} type="file" {...inputProps} className="sr-only" accept=".pdf" />
      </label>
    </div>
  );
}