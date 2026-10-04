'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Download, Pencil } from 'lucide-react';
import { useQuotes, useDeleteQuote, downloadQuotePdfUrl } from '@/hooks/use-quotes';
import { formatCurrency, formatDate } from '@/lib/format';

export default function QuotesPage() {
  const { data: quotes, isLoading } = useQuotes();
  const deleteMutation = useDeleteQuote();

  const isExpired = (createdAt: string, validityDays: number) => {
    const expiryDate = new Date(createdAt);
    expiryDate.setDate(expiryDate.getDate() + validityDays);
    return new Date() > expiryDate;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Orçamentos</h2>
          <p className="text-sm text-slate-500">
            Propostas comerciais geradas para seus clientes.
          </p>
        </div>
        <Link href="/quotes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo orçamento
          </Button>
        </Link>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Carregando...</p>}

      {!isLoading && (quotes ?? []).length === 0 && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-slate-500">
          Nenhum orçamento gerado ainda.
        </div>
      )}

      <div className="space-y-3">
        {quotes?.map((quote) => {
          const expired = isExpired(quote.createdAt, quote.validityDays);
          return (
            <Card key={quote.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-slate-900">
                    <span className="text-slate-400">
                      #{String(quote.sequenceNumber).padStart(4, '0')}
                    </span>{' '}
                    {quote.clientName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(quote.createdAt)} · {quote.items.length}{' '}
                    {quote.items.length === 1 ? 'item' : 'itens'}
                    {expired && (
                      <span className="ml-2 text-amber-600">(proposta vencida)</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mr-2 text-lg font-bold text-emerald-700">
                    {formatCurrency(quote.totalAmount)}
                  </span>
                  <Link href={`/quotes/${quote.id}`}>
                    <Button variant="outline" size="icon" title="Ver detalhes">
                      <Download className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/quotes/${quote.id}/edit`}>
                    <Button variant="outline" size="icon" title="Editar orçamento">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Excluir orçamento"
                    onClick={() => deleteMutation.mutate(quote.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}