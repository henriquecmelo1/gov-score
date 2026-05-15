import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getSalesOver20Days,
  getSalesOver30Days,
  markSalesAsOver20Days,
  markSalesAsOver30Days,
} from "@/lib/supabase/queries";
import { notifyWarningSales, notifyOverdueSales } from "@/actions/notify-overdue";

function extractSuccessfulIds(results: Array<{ saleId: string; success: boolean }>) {
  return results.filter((r) => r.success).map((r) => r.saleId);
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authorization = request.headers.get("authorization");
    if (authorization !== `Bearer ${cronSecret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createAdminClient();

  // --- 20-day check ---
  const warningSales = await getSalesOver20Days(supabase);
  let warningEmailResult = { success: true, results: [] as any[] };
  let updatedToOver20Days: Array<{ id: string; status: string }> = [];

  if (warningSales.length > 0) {
    warningEmailResult = await notifyWarningSales(supabase, warningSales);
    if (warningEmailResult.success) {
      const ids = extractSuccessfulIds(warningEmailResult.results);
      if (ids.length > 0) updatedToOver20Days = await markSalesAsOver20Days(supabase, ids);
    }
  }

  // --- 30-day check ---
  const overdueSales = await getSalesOver30Days(supabase);
  let overdueEmailResult = { success: true, results: [] as any[] };
  let updatedToOver30Days: Array<{ id: string; status: string }> = [];

  if (overdueSales.length > 0) {
    overdueEmailResult = await notifyOverdueSales(supabase, overdueSales);
    if (overdueEmailResult.success) {
      const ids = extractSuccessfulIds(overdueEmailResult.results);
      if (ids.length > 0) updatedToOver30Days = await markSalesAsOver30Days(supabase, ids);
    }
  }

  return Response.json({
    checked_at: new Date().toISOString(),
    warning: {
      total: warningSales.length,
      sales: warningSales,
      email_notifications: warningEmailResult,
      updated_sales: updatedToOver20Days,
    },
    overdue: {
      total: overdueSales.length,
      sales: overdueSales,
      email_notifications: overdueEmailResult,
      updated_sales: updatedToOver30Days,
    },
  });
}