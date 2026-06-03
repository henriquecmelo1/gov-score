import { createDebtorAction } from "@/actions/debtors";
import { formatCentsToBRL, normalizeBRLToDecimal } from "@/lib/formatters/input-formatters";
import type { SaleInput } from "@/lib/schemas/inputs/sales";
import type { Sale } from "@/lib/schemas/sales";
import type { DebtorCreateInput } from "@/lib/schemas/debtors";

// ─── CSS class helpers (task 6) ──────────────────────────────────────────────

export const inputBaseClass =
  `w-full p-2 border rounded-lg transition text-foreground bg-surface placeholder:text-foreground-dim focus:outline-none focus:ring-1`;

export const inputNormalClass =
  `${inputBaseClass} border-border focus:border-primary/60 focus:ring-primary/30`;

export const inputErrorClass =
  `${inputBaseClass} border-error/50 focus:border-error focus:ring-error/50`;

/** Returns the appropriate input class based on whether the field has a validation error. */
export function fieldClass(hasError: boolean): string {
  return hasError ? inputErrorClass : inputNormalClass;
}

// ─── Default values (task 2) ─────────────────────────────────────────────────

/** Populates form defaults from an existing sale (edit mode). */
export function getDefaultValues(sale: Sale): SaleInput {
  const rawCents = sale.valor_nf != null ? String(sale.valor_nf).replace(/[.,]/g, "") : "";
  const initialValorNf = rawCents ? formatCentsToBRL(rawCents) : "";

  return {
    entidade_devedora: sale.entidade_devedora != null ? String(sale.entidade_devedora) : "",
    valor_nf: initialValorNf,
    data_entrega: sale.data_entrega.slice(0, 10),
    numero_ordem: sale.numero_ordem ?? "",
    itens_quantidade: sale.itens_quantidade ?? "",
    numero_contrato: sale.numero_contrato ?? "",
    numero_nota_empenho: sale.numero_nota_empenho ?? "",
    alternative_email: sale.alternative_email ?? "",
    nf_file: undefined,
    contrato_file: undefined,
  };
}

/** Returns a blank SaleInput for new-form mode or post-submit resets. */
export function getEmptyDefaults(): SaleInput {
  return {
    entidade_devedora: "",
    valor_nf: "",
    data_entrega: "",
    numero_ordem: "",
    itens_quantidade: "",
    numero_contrato: "",
    numero_nota_empenho: "",
    alternative_email: "",
    nf_file: undefined,
    contrato_file: undefined,
  };
}

// ─── Submission helpers (task 4) ─────────────────────────────────────────────

/**
 * Creates a new debtor via server action if the form indicates a new CNPJ.
 * Returns the debtor id on success or an error message on failure.
 */
export async function createDebtorIfNeeded(
  isNewDebtor: boolean,
  debtorId: string,
  newDebtorData: Partial<DebtorCreateInput>,
): Promise<{ id: string } | { error: string }> {
  if (!isNewDebtor || debtorId !== "NEW") {
    return { id: debtorId };
  }

  if (!newDebtorData.name) {
    return { error: "A Razão Social do comprador é obrigatória." };
  }

  const result = await createDebtorAction(newDebtorData as DebtorCreateInput);

  if (!result.success || !result.debtor) {
    return { error: result.error ?? "Erro ao cadastrar novo comprador." };
  }

  return { id: String(result.debtor.id) };
}

/**
 * Assembles a FormData payload for the create/update sale server action.
 */
export function buildSaleFormData(
  saleId: string | undefined,
  data: SaleInput,
  debtorId: string,
  nfFile?: File,
  contratoFile?: File,
): FormData {
  const formData = new FormData();

  if (saleId) formData.append("sale_id", saleId);
  formData.append("entidade_devedora", debtorId);
  formData.append("valor_nf", normalizeBRLToDecimal(data.valor_nf));
  formData.append("data_entrega", data.data_entrega);
  formData.append("numero_ordem", data.numero_ordem);
  formData.append("numero_contrato", data.numero_contrato ?? "");
  formData.append("numero_nota_empenho", data.numero_nota_empenho ?? "");
  formData.append("alternative_email", data.alternative_email ?? "");
  formData.append("itens_quantidade", data.itens_quantidade);

  if (nfFile) formData.append("nf_file", nfFile);
  if (contratoFile) formData.append("contrato_file", contratoFile);

  return formData;
}
