import { Resend } from "resend";
import { SupabaseClient } from "@supabase/supabase-js";
import { getFileFromStorage } from "@/lib/supabase/storage";
import { getSenderDetailsByCompanyId } from "@/lib/supabase/queries";
import type { EmailTemplateParams } from "@/lib/email/template_emails";
import type { PendingSaleWithDebtorDetails } from "@/lib/supabase/queries";

type TemplateFn = (params: EmailTemplateParams) => { subject: string; html: string };

export async function sendSalesEmailNotification(
  supabase: SupabaseClient,
  sales: PendingSaleWithDebtorDetails[],
  templateFn: TemplateFn,
  companyTemplateFn?: TemplateFn
) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Cache sender details per company to avoid redundant DB calls
  const senderCache = new Map<string, Awaited<ReturnType<typeof getSenderDetailsByCompanyId>>>();

  const emailPromises = sales.map(async (sale) => {
    try {
      if (!sale.debtor_email) {
        return {
          saleId: sale.id,
          email: "",
          success: false,
          error: "No debtor email provided",
        };
      }

      // Fetch sender details (cached per company)
      if (!senderCache.has(sale.company_id)) {
        const sender = await getSenderDetailsByCompanyId(supabase, sale.company_id);
        senderCache.set(sale.company_id, sender);
      }
      const sender = senderCache.get(sale.company_id)!;

      // Build email content from template
      const { subject, html } = templateFn({
        numero_ordem: sale.numero_ordem,
        valor_nf: sale.valor_nf,
        data_entrega: sale.data_entrega,
        debtor_name: sale.debtor_name,
        sender_name: sender.razao_social,
        sender_company: sender.razao_social,
        sender_phone: sender.telefone,
        sender_email: sender.email,
        numero_contrato: sale.numero_contrato,
        numero_nota_empenho: sale.numero_nota_empenho,
      });

      // Fetch attachments
      const attachments: Array<{ filename: string; content: Buffer }> = [];

      if (sale.contrato_url) {
        console.log(`Fetching contract from: ${sale.contrato_url}`);
        const contratoFile = await getFileFromStorage(supabase, "documents", sale.contrato_url);
        if (contratoFile) {
          attachments.push({ filename: contratoFile.filename, content: contratoFile.content });
          console.log(`Contract added: ${contratoFile.filename}`);
        } else {
          console.warn(`Failed to fetch contract: ${sale.contrato_url}`);
        }
      }

      if (sale.nf_url) {
        console.log(`Fetching invoice from: ${sale.nf_url}`);
        const nfFile = await getFileFromStorage(supabase, "documents", sale.nf_url);
        if (nfFile) {
          attachments.push({ filename: nfFile.filename, content: nfFile.content });
          console.log(`Invoice added: ${nfFile.filename}`);
        } else {
          console.warn(`Failed to fetch invoice: ${sale.nf_url}`);
        }
      }

      console.log(`Sending email for sale ${sale.id} to ${sale.debtor_email} with ${attachments.length} attachments`);

      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: sale.debtor_email,
        subject,
        html,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      console.log(`Email sent successfully for sale ${sale.id} to debtor:`, result);

      if (companyTemplateFn && sender.email) {
        try {
          const { subject: cSubject, html: cHtml } = companyTemplateFn({
            numero_ordem: sale.numero_ordem,
            valor_nf: sale.valor_nf,
            data_entrega: sale.data_entrega,
            debtor_name: sale.debtor_name,
            sender_name: sender.razao_social,
            sender_company: sender.razao_social,
            sender_phone: sender.telefone,
            sender_email: sender.email,
            numero_contrato: sale.numero_contrato,
            numero_nota_empenho: sale.numero_nota_empenho,
          });

          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
            to: sender.email,
            subject: cSubject,
            html: cHtml,
          });
          console.log(`Notification email sent to company (${sender.email}) for sale ${sale.id}`);
        } catch (companyError) {
          console.error(`Failed to notify company for sale ${sale.id}:`, companyError);
        }
      }

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
  });

  return Promise.all(emailPromises);
}