import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPendingSalesOver30DaysForDebtors, markSalesAsEmailSent } from "@/lib/supabase/queries";
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
  const overdueSales = await getPendingSalesOver30DaysForDebtors(supabase);

  if (overdueSales.length === 0) {
    return Response.json({
      checked_at: new Date().toISOString(),
      total_overdue_pending_sales: 0,
      overdue_sales: [],
      email_notifications: { success: true, results: [] },
      updated_sales_to_email_sent: [],
    });
  }

  // Send email notifications to debtors
  const emailNotificationResult = await notifyOverdueSales(supabase, overdueSales);

  let updatedSales: Array<{ id: string; status: string }> = [];

  if (emailNotificationResult.success) {
    const notificationResults = emailNotificationResult.results ?? [];
    const successfulSaleIds = notificationResults
      .filter((result) => result.success)
      .flatMap((result) => {
        // Get all sales for this email from the original overdueSales
        return overdueSales
          .filter((sale) => sale.debtor_email === result.email)
          .map((sale) => sale.id);
      });

    if (successfulSaleIds.length > 0) {
      updatedSales = await markSalesAsEmailSent(supabase, successfulSaleIds);
    }
  }

  return Response.json({
    checked_at: new Date().toISOString(),
    total_overdue_pending_sales: overdueSales.length,
    overdue_sales: overdueSales,
    email_notifications: emailNotificationResult,
    updated_sales_to_email_sent: updatedSales,
  });
}