"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { sendSalesEmailNotification } from "@/lib/email/send-overdue-notification";
import { get20DayEmailTemplate, get30DayEmailTemplate } from "@/lib/email/template_emails";
import type { PendingSaleWithDebtorDetails } from "@/lib/supabase/queries";

type NotifyResult = {
  success: boolean;
  results: Array<{ saleId: string; success: boolean; error?: string }>;
  error?: string;
};

async function notifySales(
  supabase: SupabaseClient,
  sales: PendingSaleWithDebtorDetails[],
  templateFn: typeof get20DayEmailTemplate
): Promise<NotifyResult> {
  try {
    const results = await sendSalesEmailNotification(supabase, sales, templateFn);
    return { success: true, results };
  } catch (error) {
    console.error("Error sending sale notifications:", error);
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function notifyWarningSales(
  supabase: SupabaseClient,
  sales: PendingSaleWithDebtorDetails[]
): Promise<NotifyResult> {
  return notifySales(supabase, sales, get20DayEmailTemplate);
}

export async function notifyOverdueSales(
  supabase: SupabaseClient,
  sales: PendingSaleWithDebtorDetails[]
): Promise<NotifyResult> {
  return notifySales(supabase, sales, get30DayEmailTemplate);
}