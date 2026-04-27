"use server";

import { sendOverdueNotification } from "@/lib/email/send-overdue-notification";

interface OverdueSale {
  id: string;
  entidade_devedora: string;
  owner_email: string | null;
}

export async function notifyOverdueSales(overdueSales: OverdueSale[]) {
  try {
    const results = await sendOverdueNotification(overdueSales);
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
