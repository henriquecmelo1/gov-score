import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPendingSalesOver30Days } from "@/lib/supabase/queries";

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

  return Response.json({
    checked_at: new Date().toISOString(),
    total_overdue_pending_sales: overdueSales.length,
    overdue_sales: overdueSales.map((sale) => ({
      id: sale.id,
      entidade_devedora: sale.entidade_devedora,
      company_id: sale.company_id,
      owner_email: owners.find((owner) => owner.company_id === sale.company_id)?.email ?? null,
    })),
  });
}