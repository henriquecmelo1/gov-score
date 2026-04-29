import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPendingSalesOver30Days, markSalesAsEmailSent } from "@/lib/supabase/queries";
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
  const overdueSales = await getPendingSalesOver30Days(supabase);

  const ownerIds = [...new Set(overdueSales.map((sale) => sale.company_id))];
  const owners = await Promise.all(
    ownerIds.map(async (companyId) => {
      const { data, error } = await supabase.auth.admin.getUserById(companyId);

      if (error) {
        throw new Error(error.message);
      }

      return {
        company_id: companyId,
        email: data.user?.email ?? null,
      };
    })
  );

  const overdueSalesWithEmails = overdueSales.map((sale) => ({
    id: sale.id,
    entidade_devedora: sale.entidade_devedora,
    company_id: sale.company_id,
    owner_email: owners.find((owner) => owner.company_id === sale.company_id)?.email ?? null,
  }));

  // Send email notifications
  const emailNotificationResult = await notifyOverdueSales(overdueSalesWithEmails);

  let updatedSales: Array<{ id: string; status: string }> = [];

  if (emailNotificationResult.success) {
    const notificationResults = emailNotificationResult.results ?? [];
    const successfulEmails = new Set(
      notificationResults.filter((result) => result.success).map((result) => result.email)
    );

    const saleIdsWithSentEmail = overdueSalesWithEmails
      .filter((sale) => sale.owner_email && successfulEmails.has(sale.owner_email))
      .map((sale) => sale.id);

    updatedSales = await markSalesAsEmailSent(supabase, saleIdsWithSentEmail);
  }

  return Response.json({
    checked_at: new Date().toISOString(),
    total_overdue_pending_sales: overdueSales.length,
    overdue_sales: overdueSalesWithEmails,
    email_notifications: emailNotificationResult,
    updated_sales_to_email_sent: updatedSales,
  });
}