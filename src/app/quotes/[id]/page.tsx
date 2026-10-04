'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, Pencil, MessageCircle } from 'lucide-react';
import { useQuote, downloadQuotePdfUrl } from '@/hooks/use-quotes';
import { buildWhatsAppQuoteLink } from '@/lib/whatsapp';
import { formatCurrency, formatDate } from '@/lib/format';

export default function QuoteDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { data: quote, isLoading } = useQuote(params.id);

    if (isLoading || !quote) {
        return (
            <div className="mx-auto max-w-2xl space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    const expiryDate = new Date(quote.createdAt);
    expiryDate.setDate(expiryDate.getDate() + quote.validityDays);
    const isExpired = new Date() > expiryDate;

    const whatsappLink = buildWhatsAppQuoteLink({
        clientContact: quote.clientContact,
        clientName: quote.clientName,
        totalAmount: quote.totalAmount,
        pdfUrl: downloadQuotePdfUrl(quote.id),
    });

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.push('/quotes')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/quotes/${quote.id}/edit`)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                    <a href={whatsappLink} target="_blank" rel="noreferrer">
                        <Button variant="outline" className="border-emerald-600 text-emerald-700">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Enviar por WhatsApp
                        </Button>
                    </a>
                    <a href={downloadQuotePdfUrl(quote.id)} target="_blank" rel="noreferrer">
                        <Button>
                            <Download className="mr-2 h-4 w-4" />
                            Baixar PDF
                        </Button>
                    </a>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    Orçamento nº {String(quote.sequenceNumber).padStart(4, '0')} — {quote.clientName}
                </h2>
                <p className="text-sm text-slate-500">
                    Emitido em {formatDate(quote.createdAt)} · válido por {quote.validityDays} dias
                    {isExpired && <span className="ml-2 text-amber-600">(proposta vencida)</span>}
                </p>
                {quote.clientContact && (
                    <p className="text-sm text-slate-500">Contato: {quote.clientContact}</p>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Itens do orçamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {quote.items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between rounded-md border p-3 text-sm"
                        >
                            <div>
                                <span className="font-medium">{item.productName}</span> — {item.quantity} x{' '}
                                {formatCurrency(item.unitPrice)}
                            </div>
                            <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="border-slate-900 bg-slate-50">
                <CardContent className="space-y-2 p-5 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-600">Subtotal</span>
                        <span>{formatCurrency(quote.subtotal)}</span>
                    </div>
                    {quote.discountAmount > 0 && (
                        <div className="flex justify-between text-red-700">
                            <span>Desconto</span>
                            <span>- {formatCurrency(quote.discountAmount)}</span>
                        </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold text-emerald-700">
                        <span>Total</span>
                        <span>{formatCurrency(quote.totalAmount)}</span>
                    </div>
                </CardContent>
            </Card>

            {quote.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Observações</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600">{quote.notes}</CardContent>
                </Card>
            )}
        </div>
    );
}