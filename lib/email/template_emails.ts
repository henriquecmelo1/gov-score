export type EmailTemplateParams = {
  numero_ordem: string;
  valor_nf: string;
  data_entrega: string;
  debtor_name: string;
  sender_name: string;
  sender_company: string;
  sender_phone: string;
  sender_email: string;
};

function formatCurrency(value: string): string {
  const num = parseFloat(value);
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateStr: string): string {
  // Date-only strings are parsed as UTC by new Date(), causing off-by-one in BRT.
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    dateStr = dateStr + "T00:00:00";
  }
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

const baseStyle = `
  font-family: Arial, sans-serif;
  font-size: 14px;
  color: #222;
  line-height: 1.7;
  max-width: 680px;
  margin: 0 auto;
  padding: 32px 24px;
`;

export function get20DayEmailTemplate(params: EmailTemplateParams): {
  subject: string;
  html: string;
} {
  const subject = `Lembrete de Pagamento – NF nº ${params.numero_ordem}`;

  const html = `
    <div style="${baseStyle}">
      <p>Boa tarde,</p>

      <p>Esperamos que estejam bem.</p>

      <p>
        Informamos que esta comunicação é realizada por meio do nosso sistema de gestão
        e acompanhamento financeiro (<strong>GovScore</strong>), utilizado para monitoramento
        de prazos e obrigações contratuais.
      </p>

      <p>
        Encaminhamos, assim, este primeiro lembrete de pagamento referente à seguinte nota fiscal:
      </p>

      <table style="border-collapse: collapse; margin: 16px 0; width: 100%;">
        <tr>
          <td style="padding: 6px 12px; font-weight: bold; width: 200px;">Nota Fiscal</td>
          <td style="padding: 6px 12px;">nº ${params.numero_ordem}</td>
        </tr>
        <tr style="background: #f5f5f5;">
          <td style="padding: 6px 12px; font-weight: bold;">Valor</td>
          <td style="padding: 6px 12px;">${formatCurrency(params.valor_nf)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px; font-weight: bold;">Data de recebimento</td>
          <td style="padding: 6px 12px;">${formatDate(params.data_entrega)}</td>
        </tr>
        <tr style="background: #f5f5f5;">
          <td style="padding: 6px 12px; font-weight: bold;">Contrato</td>
          <td style="padding: 6px 12px;">[CONTRATO_NUMERO]</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px; font-weight: bold;">Nota de Empenho</td>
          <td style="padding: 6px 12px;">[NOTA_EMPENHO]</td>
        </tr>
        <tr style="background: #f5f5f5;">
          <td style="padding: 6px 12px; font-weight: bold;">Órgão</td>
          <td style="padding: 6px 12px;">${params.debtor_name}</td>
        </tr>
      </table>

      <p>
        Informamos que os materiais foram devidamente recebidos e atestados em
        <strong>${formatDate(params.data_entrega)}</strong>, conforme comprovante anexo.
      </p>

      <p>
        Nos termos do art. 141 da Lei nº 14.133/2021, o pagamento pela Administração Pública
        deve ocorrer no prazo de até 30 dias após o recebimento definitivo, salvo disposição
        contratual em contrário.
      </p>

      <p>
        Dessa forma, solicitamos, por gentileza, a informação sobre a previsão de pagamento
        da referida nota.
      </p>

      <p>Para facilitar a análise e tramitação interna, seguem anexos:</p>
      <ul>
        <li>Comprovante de recebimento</li>
        <li>Nota fiscal em PDF</li>
        <li>Certidões atualizadas</li>
      </ul>

      <p>
        Permanecemos à disposição para quaisquer esclarecimentos e, após a realização do
        pagamento, solicitamos a gentileza de encaminhar o respectivo comprovante.
      </p>

      <p>Aguardamos retorno.</p>

      <p>Atenciosamente,</p>

      <p>
        <strong>${params.sender_name}</strong><br />
        ${params.sender_company}<br />
        ${params.sender_phone}<br />
        ${params.sender_email}
      </p>
    </div>
  `;

  return { subject, html };
}

export function get30DayEmailTemplate(params: EmailTemplateParams): {
  subject: string;
  html: string;
} {
  const subject = `Nota Vencida – Solicitação de Regularização – NF nº ${params.numero_ordem}`;

  const html = `
    <div style="${baseStyle}">
      <p>Boa tarde,</p>

      <p>Esperamos que estejam bem.</p>

      <p>
        Informamos que esta comunicação é realizada por meio do nosso sistema de gestão
        e acompanhamento financeiro (<strong>GovScore</strong>), utilizado para monitoramento
        de prazos e obrigações contratuais.
      </p>

      <p>
        Verificamos que a <strong>Nota Fiscal nº ${params.numero_ordem}</strong>, no valor de
        <strong>${formatCurrency(params.valor_nf)}</strong>, referente ao Contrato nº [CONTRATO_NUMERO]
        e Nota de Empenho nº [NOTA_EMPENHO], encontra-se com prazo de pagamento vencido.
      </p>

      <p>
        Destacamos que os materiais foram devidamente recebidos e atestados em
        <strong>${formatDate(params.data_entrega)}</strong>, conforme documentação já encaminhada.
      </p>

      <p>
        Nos termos do art. 141 da Lei nº 14.133/2021, o pagamento deveria ter ocorrido no
        prazo de até 30 dias após o recebimento definitivo, salvo disposição contratual diversa.
      </p>

      <p>
        Diante do exposto, solicitamos, com a devida atenção, a regularização do pagamento ou,
        alternativamente, a informação atualizada da previsão para quitação.
      </p>

      <p>
        Reforçamos que o acompanhamento deste processo permanece ativo em nosso sistema
        (<strong>GovScore</strong>), visando controle e atualização dos prazos.
      </p>

      <p>Para facilitar a tramitação, seguem novamente anexos:</p>
      <ul>
        <li>Comprovante de recebimento</li>
        <li>Nota fiscal em PDF</li>
        <li>Certidões atualizadas</li>
      </ul>

      <p>
        Permanecemos à disposição para quaisquer esclarecimentos e solicitamos, após a
        realização do pagamento, o envio do respectivo comprovante.
      </p>

      <p>Aguardamos retorno com brevidade.</p>

      <p>Atenciosamente,</p>

      <p>
        <strong>${params.sender_name}</strong><br />
        ${params.sender_company}<br />
        ${params.sender_phone}<br />
        ${params.sender_email}
      </p>
    </div>
  `;

  return { subject, html };
}