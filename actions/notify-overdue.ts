"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { sendOverdueNotification } from "@/lib/email/send-overdue-notification";
import type { PendingSaleWithDebtorDetails } from "@/lib/supabase/queries";

export async function notifyOverdueSales(supabase: SupabaseClient, overdueSales: PendingSaleWithDebtorDetails[]) {
  try {
    const results = await sendOverdueNotification(supabase, overdueSales);
    return {
      success: true,
      results,
    };
  } catch (error) {
    console.error("Error notifying overdue sales:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
