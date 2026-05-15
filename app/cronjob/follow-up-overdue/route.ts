import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSalesStillOver30Days } from "@/lib/supabase/queries";
import { notifyOverdueSales } from "@/actions/notify-overdue";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authorization = request.headers.get("authorization");
    if (authorization !== `Bearer ${cronSecret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createAdminClient();
  const overdueSales = await getSalesStillOver30Days(supabase);

  if (overdueSales.length === 0) {
    return Response.json({
      checked_at: new Date().toISOString(),
      total: 0,
      sales: [],
      email_notifications: { success: true, results: [] },
    });
  }

  const emailResult = await notifyOverdueSales(supabase, overdueSales);

  return Response.json({
    checked_at: new Date().toISOString(),
    total: overdueSales.length,
    sales: overdueSales,
    email_notifications: emailResult,
  });
}