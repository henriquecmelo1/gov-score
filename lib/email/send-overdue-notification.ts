import { Resend } from "resend";

interface OverdueSale {
  id: string;
  entidade_devedora: string;
  owner_email: string | null;
}

export async function sendOverdueNotification(overdueSales: OverdueSale[]) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const salesByEmail = new Map<string, OverdueSale[]>();

  for (const sale of overdueSales) {
    if (!sale.owner_email) continue;

    if (!salesByEmail.has(sale.owner_email)) {
      salesByEmail.set(sale.owner_email, []);
    }
    salesByEmail.get(sale.owner_email)!.push(sale);
  }

  const emailPromises = Array.from(salesByEmail.entries()).map(
    async ([email, sales]) => {
      const htmlContent = sales
        .map(
          (sale) =>
            `<p>Sua venda para a organização <strong>${sale.entidade_devedora}</strong> está sem pagamento há mais de 30 dias. Mande um e-mail para cobrá-la.</p>`
        )
        .join("");

      try {
        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          to: 'henriquecmelo1@gmail.com',
          subject: "Aviso: Venda com pagamento em atraso",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Notificação de Pagamento em Atraso</h2>
              ${htmlContent}
              <p style="margin-top: 20px; color: #666; font-size: 12px;">
                Este é um email automático gerado pelo sistema Gov Score.
              </p>
            </div>
          `,
        });

        return {
          email,
          success: true,
          result,
        };
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        return {
          email,
          success: false,
          error,
        };
      }
    }
  );

  const results = await Promise.all(emailPromises);
  return results;
}
