"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const validStatuses = new Set(["pendente", "enviado email", "pago"]);

function resolveStatus(rawStatus: FormDataEntryValue | null, fallback = "pendente") {
  const status = String(rawStatus ?? "").trim().toLowerCase();
  return validStatuses.has(status) ? status : fallback;
}

function sanitizeStorageFileName(originalName: string) {
  const trimmed = originalName.trim();
  const lastDot = trimmed.lastIndexOf(".");
  const hasExt = lastDot > 0 && lastDot < trimmed.length - 1;
  const baseName = hasExt ? trimmed.slice(0, lastDot) : trimmed;
  const extension = hasExt ? trimmed.slice(lastDot + 1) : "";

  const safeBase = baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-._]+|[-._]+$/g, "")
    .toLowerCase();

  const safeExt = extension
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toLowerCase();

  const finalBase = safeBase || "arquivo";
  return safeExt ? `${finalBase}.${safeExt}` : finalBase;
}

function buildStoragePath(userId: string, saleId: string, type: "nfs" | "contratos", file: File) {
  const safeFileName = sanitizeStorageFileName(file.name);
  return `${userId}/${saleId}/${type}/${safeFileName}`;
}

async function uploadSaleFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  saleId: string,
  file: File,
  type: "nfs" | "contratos"
) {
  if (!file || file.size === 0) return null;

  const filePath = buildStoragePath(userId, saleId, type, file);
  const { data, error } = await supabase.storage
    .from("documents")
    .upload(filePath, file, { upsert: true });

  if (error) throw new Error(`Erro no upload: ${error.message}`);
  return data.path;
}

export async function createSaleAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  try {
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        company_id: user.id,
        entidade_devedora: formData.get("entidade_devedora"),
        valor_nf: parseFloat(formData.get("valor_nf") as string),
        data_entrega: formData.get("data_entrega"),
        numero_ordem: formData.get("numero_ordem"),
        itens_quantidade: formData.get("itens_quantidade"),
        status: resolveStatus(formData.get("status"), "pendente"),
      })
      .select("id")
      .single();

    if (saleError || !sale) throw new Error("Erro ao registrar dados da venda.");

    const saleId = sale.id;

    const nfFile = formData.get("nf_file") as File;
    const contratoFile = formData.get("contrato_file") as File;

    const [nfPath, contratoPath] = await Promise.all([
      uploadSaleFile(supabase, user.id, saleId, nfFile, "nfs"),
      uploadSaleFile(supabase, user.id, saleId, contratoFile, "contratos")
    ]);

    const { error: updateError } = await supabase
      .from("sales")
      .update({
        nf_url: nfPath,
        contrato_url: contratoPath,
      })
      .eq("id", saleId);

    if (updateError) throw updateError;

    revalidatePath("/profile");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro inesperado ao criar venda";
    return { error: message };
  }
}

export async function updateSaleAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };
  const userId = user.id;

  const saleId = String(formData.get("sale_id") ?? "").trim();
  if (!saleId) return { error: "Venda inválida" };

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .select("id, company_id, nf_url, contrato_url, status")
    .eq("id", saleId)
    .eq("company_id", userId)
    .single();

  if (saleError || !sale) {
    return { error: "Venda não encontrada" };
  }

  const nfFile = formData.get("nf_file") as File;
  const contratoFile = formData.get("contrato_file") as File;

  try {
    const nfPath = nfFile && nfFile.size > 0 ? await uploadSaleFile(supabase, userId, saleId, nfFile, "nfs") : sale.nf_url;
    const contratoPath = contratoFile && contratoFile.size > 0 ? await uploadSaleFile(supabase, userId, saleId, contratoFile, "contratos") : sale.contrato_url;

    const { error } = await supabase.from("sales").update({
      entidade_devedora: formData.get("entidade_devedora"),
      valor_nf: parseFloat(formData.get("valor_nf") as string),
      data_entrega: formData.get("data_entrega"),
      numero_ordem: formData.get("numero_ordem"),
      itens_quantidade: formData.get("itens_quantidade"),
      status: resolveStatus(formData.get("status"), sale.status),
      nf_url: nfPath,
      contrato_url: contratoPath,
    }).eq("id", saleId).eq("company_id", userId);

    if (error) throw error;

    revalidatePath("/profile");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro inesperado ao atualizar venda";
    return { error: message };
  }
}

export async function deleteSaleAction(saleId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };
  const userId = user.id;

  const trimmedSaleId = saleId.trim();
  if (!trimmedSaleId) return { error: "Venda inválida" };

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .select("id, company_id, nf_url, contrato_url")
    .eq("id", trimmedSaleId)
    .eq("company_id", userId)
    .single();

  if (saleError || !sale) {
    return { error: "Venda não encontrada" };
  }

  const objectPaths = [sale.nf_url, sale.contrato_url].filter(Boolean) as string[];
  if (objectPaths.length > 0) {
    const { error: removeError } = await supabase.storage.from("documents").remove(objectPaths);
    if (removeError) {
      return { error: `Erro ao remover arquivos: ${removeError.message}` };
    }
  }

  const { error } = await supabase
    .from("sales")
    .delete()
    .eq("id", trimmedSaleId)
    .eq("company_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function updateSaleStatusAction(saleId: string, status: "pago" | "pendente") {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const userId = user.id;
  const trimmedSaleId = saleId.trim();
  if (!trimmedSaleId) return { error: "Venda inválida" };

  const normalizedStatus = status === "pago" ? "pago" : "pendente";

  const { error } = await supabase
    .from("sales")
    .update({ status: normalizedStatus })
    .eq("id", trimmedSaleId)
    .eq("company_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}