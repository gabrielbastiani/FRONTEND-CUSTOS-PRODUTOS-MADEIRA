/**
 * Monta um link do WhatsApp (wa.me) com uma mensagem pré-preenchida. Não é
 * possível anexar o PDF automaticamente por esse método (limitação do
 * próprio WhatsApp) — a mensagem inclui um link para o cliente baixar o
 * orçamento. O número de telefone deve estar em formato internacional, sem
 * espaços ou símbolos (ex: 5511999998888). Se o contato informado não
 * parecer um telefone, o link abre o WhatsApp sem destinatário definido,
 * permitindo ao usuário escolher o contato manualmente.
 */
export function buildWhatsAppQuoteLink(params: {
  clientContact?: string | null;
  clientName: string;
  totalAmount: number;
  pdfUrl: string;
}): string {
  const { clientContact, clientName, totalAmount, pdfUrl } = params;

  const formattedTotal = totalAmount.toFixed(2).replace('.', ',');
  const message =
    `Olá, ${clientName}! Segue o orçamento solicitado, no valor total de R$ ${formattedTotal}. ` +
    `Você pode conferir todos os detalhes no PDF em anexo: ${pdfUrl}`;

  const encodedMessage = encodeURIComponent(message);

  const digitsOnly = (clientContact ?? '').replace(/\D/g, '');
  const looksLikePhone = digitsOnly.length >= 10;

  if (looksLikePhone) {
    return `https://wa.me/${digitsOnly}?text=${encodedMessage}`;
  }

  return `https://wa.me/?text=${encodedMessage}`;
}