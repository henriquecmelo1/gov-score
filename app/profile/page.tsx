import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCompanyProfile, getCompanySales, searchDebtors } from "@/lib/supabase/queries";
import { SalesSection } from "@/components/sales/sales-section";
import { CompanyProfileCard } from "@/components/profile/company-profile-card";
import { Alert } from "@/components/ui/alert";

type ProfilePageProps = {
  searchParams: Promise<{ success?: string }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const resolvedParams = await searchParams;
  const isResetSuccess = resolvedParams.success === "password-reset";

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  const [profileResult, sales, debtors] = await Promise.all([
    getCompanyProfile(supabase, user.id),
    getCompanySales(supabase, user.id),
    searchDebtors(supabase),
  ]);

  const { data: profile } = profileResult;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {isResetSuccess && (
        <Alert variant="success">
          Sua senha foi atualizada com sucesso!
        </Alert>
      )}

      <CompanyProfileCard
        razaoSocial={profile?.razao_social}
        cnpj={profile?.cnpj}
        email={user.email}
        telefone={profile?.telefone}
      />

      <SalesSection initialSales={sales || []} debtors={debtors || []} />
    </div>
  );
}