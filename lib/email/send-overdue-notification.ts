import { Resend } from "resend";
import { SupabaseClient } from "@supabase/supabase-js";
import { getFileFromStorage } from "@/lib/supabase/storage";

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

  // Send one email per sale (not grouped by debtor)
  const emailPromises = overdueSales.map(async (sale) => {
      try {
      if (!sale.debtor_email) {
        return {
          saleId: sale.id,
          email: "",
          success: false,
          error: "No debtor email provided",
        };
      }

      // Get attachments for this specific sale
      const attachments: Array<{ filename: string; content: Buffer }> = [];

      // Get contract file
      if (sale.contrato_url) {
        console.log(`Fetching contract from: ${sale.contrato_url}`);
        const contratoFile = await getFileFromStorage(supabase, "documents", sale.contrato_url);
        if (contratoFile) {
          attachments.push({
            filename: contratoFile.filename,
            content: contratoFile.content,
            });
          console.log(`Contract added: ${contratoFile.filename}`);
        } else {
          console.warn(`Failed to fetch contract: ${sale.contrato_url}`);
          }
        }

      // Get invoice file
      if (sale.nf_url) {
        console.log(`Fetching invoice from: ${sale.nf_url}`);
        const nfFile = await getFileFromStorage(supabase, "documents", sale.nf_url);
        if (nfFile) {
          attachments.push({
            filename: nfFile.filename,
            content: nfFile.content,
          });
          console.log(`Invoice added: ${nfFile.filename}`);
        } else {
          console.warn(`Failed to fetch invoice: ${sale.nf_url}`);
        }
      }

      const formattedDate = new Date(sale.data_entrega).toLocaleDateString("pt-BR");

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
            <h2 style="color: #333;">Aviso de Pagamento em Atraso</h2>
            
          <p>Olá ${sale.debtor_name},</p>
            
          <p>
            A venda de número <strong>${sale.numero_ordem}</strong> para o cliente <strong>${sale.company_name}</strong> 
            de R$ <strong>${sale.valor_nf}</strong> está com o pagamento atrasado há mais de 30 dias. 
            A data de entrega foi <strong>${formattedDate}</strong> 
            e o pagamento ainda não foi registrado.
          </p>
          
          <p>Segue em anexo o contrato e a nota fiscal.</p>
            
            <p style="margin-top: 20px; font-style: italic; color: #666;">
              Caso o pagamento já tenha sido realizado, desconsidere esta mensagem.
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
            
            <p style="margin-top: 20px; color: #999; font-size: 12px;">
              Este é um email automático gerado pelo sistema Gov Score. Por favor, não responda este email.
            </p>
          </div>
        `;

        console.log(`Sending email for sale ${sale.id} to ${sale.debtor_email} with ${attachments.length} attachments`);

        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          to: sale.debtor_email,
          subject: `Aviso: Venda ${sale.numero_ordem} com pagamento em atraso`,
          html: htmlContent,
          attachments: attachments.length > 0 ? attachments : undefined,
        });

        console.log(`Email sent successfully for sale ${sale.id}:`, result);

        return {
          saleId: sale.id,
          email: sale.debtor_email,
          success: true,
          attachmentsCount: attachments.length,
          result,
        };
      } catch (error) {
        console.error(`Failed to send email for sale ${sale.id}:`, error);
        return {
          saleId: sale.id,
          email: sale.debtor_email,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  );

  const results = await Promise.all(emailPromises);
  return results;
}
