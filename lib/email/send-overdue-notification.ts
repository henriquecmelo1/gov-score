import { Resend } from "resend";
import { SupabaseClient } from "@supabase/supabase-js";
import { getFilesFromStorage } from "@/lib/supabase/storage";

interface OverdueSaleForDebtor {
  id: string;
  numero_ordem: string;
  valor_nf: string;
  data_entrega: string;
  debtor_email: string;
  debtor_name: string;
  company_name: string;
  contrato_url: string | null;
  nf_url: string | null;
}

export async function sendOverdueNotification(
  supabase: SupabaseClient,
  overdueSales: OverdueSaleForDebtor[]
) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const salesByDebtorEmail = new Map<string, OverdueSaleForDebtor[]>();

  for (const sale of overdueSales) {
    if (!sale.debtor_email) continue;

    if (!salesByDebtorEmail.has(sale.debtor_email)) {
      salesByDebtorEmail.set(sale.debtor_email, []);
    }
    salesByDebtorEmail.get(sale.debtor_email)!.push(sale);
  }

  const emailPromises = Array.from(salesByDebtorEmail.entries()).map(
    async ([email, sales]) => {
      try {
        // Get all attachments for this debtor's sales
        const allAttachments: Array<{ filename: string; content: string; contentType?: string }> = [];

        for (const sale of sales) {
          const filePaths = [sale.contrato_url, sale.nf_url];
          const files = await getFilesFromStorage(supabase, "documents", filePaths);

          for (const file of files) {
            allAttachments.push({
              filename: file.filename,
              content: file.content.toString("base64"),
              contentType: file.mimeType,
            });
          }
        }

        // Format sale details in email body
        const salesContent = sales
          .map(
            (sale) => `
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
          <p><strong>Número da Venda:</strong> ${sale.numero_ordem}</p>
          <p><strong>Cliente:</strong> ${sale.company_name}</p>
          <p><strong>Valor da Nota Fiscal:</strong> R$ ${sale.valor_nf}</p>
          <p><strong>Data de Entrega:</strong> ${new Date(sale.data_entrega).toLocaleDateString("pt-BR")}</p>
        </div>
          `
          )
          .join("");

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
            <h2 style="color: #333;">Aviso de Pagamento em Atraso</h2>
            
            <p>Olá ${sales[0].debtor_name},</p>
            
            ${sales
              .map(
                (sale) => `
              <p>
                A venda de número <strong>${sale.numero_ordem}</strong> para o cliente <strong>${sale.company_name}</strong> 
                de R$ <strong>${sale.valor_nf}</strong> está com o pagamento atrasado há mais de 30 dias. 
                A data de entrega foi <strong>${new Date(sale.data_entrega).toLocaleDateString("pt-BR")}</strong> 
                e o pagamento ainda não foi registrado.
              </p>
              
              <p>Segue em anexo o contrato e a nota fiscal.</p>
              `
              )
              .join("")}
            
            <p style="margin-top: 20px; font-style: italic; color: #666;">
              Caso o pagamento já tenha sido realizado, desconsidere esta mensagem.
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
            
            <p style="margin-top: 20px; color: #999; font-size: 12px;">
              Este é um email automático gerado pelo sistema Gov Score. Por favor, não responda este email.
            </p>
          </div>
        `;

        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          to: email,
          subject: "Aviso: Venda com pagamento em atraso",
          html: htmlContent,
          attachments: allAttachments.length > 0 ? allAttachments : undefined,
        });

        return {
          email,
          success: true,
          salesCount: sales.length,
          attachmentsCount: allAttachments.length,
          result,
        };
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        return {
          email,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  );

  const results = await Promise.all(emailPromises);
  return results;
}
