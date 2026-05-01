"use server";

import { createClient } from "@/lib/supabase/server";
import { debtorCreateSchema, DebtorCreateInput } from "@/lib/schemas/debtors";
import { revalidatePath } from "next/cache";

export async function createDebtorAction(data: DebtorCreateInput) {
  const parsed = debtorCreateSchema.safeParse(data);
  if (!parsed.success) return { error: "Dados inválidos" };

  const supabase = await createClient();

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) return { error: userError.message };

    const user = userData?.user ?? null;
    if (!user) return { error: "Não autorizado" };

    const payload = { ...parsed.data, user_id: user.id };

    const { data: inserted, error: insertError } = await supabase.from("debtors").insert(payload).select().single();
    if (insertError) return { error: insertError.message };

    revalidatePath("/debtors");
    return { success: true, debtor: inserted };
  } catch (err: unknown) {
    if (err && typeof err === "object" && "message" in err) {
      return { error: (err as any).message };
    }
    return { error: "Erro ao criar cliente" };
  }
}
