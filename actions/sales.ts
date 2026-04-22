"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSaleAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };
  const userId = user.id;

  const nfFile = formData.get("nf_file") as File;
  const contratoFile = formData.get("contrato_file") as File;

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

  async function uploadFile(file: File, type: 'nfs' | 'contratos') {
    if (!file || file.size === 0) return null;
    const safeFileName = sanitizeStorageFileName(file.name);
    const fileName = `private/${userId}/${type}/${Date.now()}-${safeFileName}`;
    const { data, error } = await supabase.storage
      .from("documents")
      .upload(fileName, file);
    
    if (error) throw new Error(`Erro no upload: ${error.message}`);
    return data.path;
  }

  try {
    const nfPath = await uploadFile(nfFile, "nfs");
    const contratoPath = await uploadFile(contratoFile, "contratos");

    const { error } = await supabase.from("sales").insert({
      company_id: userId,
      entidade_devedora: formData.get("entidade_devedora"),
      valor_nf: parseFloat(formData.get("valor_nf") as string),
      data_entrega: formData.get("data_entrega"),
      numero_ordem: formData.get("numero_ordem"),
      itens_quantidade: formData.get("itens_quantidade"),
      nf_url: nfPath,
      contrato_url: contratoPath,
      status: "pendente"
    });

    if (error) throw error;

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro inesperado ao criar venda";
    return { error: message };
  }
}