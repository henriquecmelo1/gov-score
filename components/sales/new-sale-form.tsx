"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saleSchema, type SaleInput } from "@/lib/schemas/inputs/sales";
import { createSaleAction, updateSaleAction } from "@/actions/sales";
import { formatCentsToBRL } from "@/lib/formatters/input-formatters";
import { getFileNameFromUrl } from "@/lib/formatters";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DebtorSection, formatCNPJ } from "./debtor-section";
import { FileUploadField } from "@/components/ui/file-upload-field";
import { FIELD_LABELS } from "@/lib/constants/sales";
import {
  getDefaultValues,
  getEmptyDefaults,
  createDebtorIfNeeded,
  buildSaleFormData,
  fieldClass,
} from "@/lib/helpers/sale-form-helpers";
import { useDebtorSearch } from "@/hooks/use-debtor-search";
import { useFileInputKey } from "@/hooks/use-file-input-key";
import type { Sale } from "@/lib/schemas/sales";
import type { Debtor } from "@/lib/schemas/debtors";

type SaleFormProps = {
  onSuccess: (mode: "create" | "update") => void;
  sale?: Sale | null;
  debtors: Debtor[];
};

export function NewSaleForm({ onSuccess, sale, debtors }: SaleFormProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [nfInputKey, resetNfKey] = useFileInputKey();
  const [contratoInputKey, resetContratoKey] = useFileInputKey();
  const isEditing = Boolean(sale);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    setError,
  } = useForm<SaleInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: sale ? getDefaultValues(sale) : getEmptyDefaults(),
  });

  const {
    cnpjSearch,
    setCnpjSearch,
    isSearchingCnpj,
    isNewDebtor,
    newDebtorData,
    lockedDebtorFields,
    handleCnpjChange,
    handleNewDebtorChange,
    resetDebtorState,
  } = useDebtorSearch(debtors, setValue);

  const selectedDebtorId = useWatch({ control, name: "entidade_devedora" });
  const selectedDebtor = debtors.find(d => String(d.id) === String(selectedDebtorId));

  const nfFileList = useWatch({ control, name: "nf_file" });
  const nfFile = nfFileList?.[0];
  const contratoFileList = useWatch({ control, name: "contrato_file" });
  const contratoFile = contratoFileList?.[0];

  const nfDisplayName = nfFile?.name ?? (sale?.nf_url ? getFileNameFromUrl(sale.nf_url) : null);
  const contratoDisplayName = contratoFile?.name ?? (sale?.contrato_url ? getFileNameFromUrl(sale.contrato_url) : null);

  useEffect(() => {
    reset(sale ? getDefaultValues(sale) : getEmptyDefaults());
    if (sale) {
      const debtor = debtors.find(d => String(d.id) === String(sale.entidade_devedora));
      if (debtor?.cnpj) setCnpjSearch(formatCNPJ(debtor.cnpj));
    }
  }, [sale, reset, debtors, setCnpjSearch]);

  const onSubmit = async (data: SaleInput) => {
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
      const debtorResult = await createDebtorIfNeeded(isNewDebtor, data.entidade_devedora, newDebtorData);
      
      if ("error" in debtorResult) {
        setErrorMessage(debtorResult.error);
        setLoading(false);
        return;
      }
      
      const finalDebtorId = debtorResult.id;

      if (!finalDebtorId || finalDebtorId === "NEW") {
        setErrorMessage("Por favor, selecione ou preencha os dados de um comprador válido.");
        setLoading(false);
        return;
      }

      const formData = buildSaleFormData(
        sale?.id,
        data,
        finalDebtorId,
        data.nf_file?.[0],
        data.contrato_file?.[0]
      );

      const result = sale
        ? await updateSaleAction(formData)
        : await createSaleAction(formData);

      if (result.success) {
        reset(getEmptyDefaults());
        resetDebtorState();
        onSuccess(sale ? "update" : "create");
      } else {
        setErrorMessage(result.error ?? "Não foi possível salvar a venda.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Ocorreu um erro inesperado ao salvar a venda.");
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (formErrors: any) => {
    const errorList = Object.entries(formErrors)
      .map(([key, err]: any) => {
        const fieldName = FIELD_LABELS[key] ?? key;
        return `${fieldName}: ${err?.message || "campo inválido"}`;
      });
    
    if (errorList.length > 0) {
      setErrorMessage(`Por favor, corrija os seguintes erros: ${errorList.join(" | ")}`);
    } else {
      setErrorMessage("Revise os campos obrigatórios destacados em vermelho.");
    }
  };

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
                className={fieldClass(!!errors.valor_nf)}
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
            className={fieldClass(!!errors.numero_ordem)}
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
            className={fieldClass(!!errors.data_entrega)}
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
            className={fieldClass(!!errors.numero_contrato)}
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
            className={fieldClass(!!errors.numero_nota_empenho)}
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
            className={fieldClass(!!errors.alternative_email)}
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
          className={`${fieldClass(!!errors.itens_quantidade)} resize-y`}
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
            resetNfKey();
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
            resetContratoKey();
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