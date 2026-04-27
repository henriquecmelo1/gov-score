import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCompanyProfile, getCompanySales } from "@/lib/supabase/queries";
import { SalesSection } from "@/components/sales/sales-section";
import { CompanyProfileCard } from "@/components/profile/company-profile-card";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  const [{ data: profile }, { data: sales }] = await Promise.all([
    getCompanyProfile(supabase, user.id),
    getCompanySales(supabase, user.id)
  ]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <CompanyProfileCard
        razaoSocial={profile?.razao_social}
        cnpj={profile?.cnpj}
        email={user.email}
        telefone={profile?.telefone}
      />

      <SalesSection initialSales={sales || []} />
    </div>
  );
}