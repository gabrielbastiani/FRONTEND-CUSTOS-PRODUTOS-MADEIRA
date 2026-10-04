'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FieldHint } from '@/components/ui/field-hint';
import { SectionIntro } from '@/components/ui/section-intro';
import { Trash2 } from 'lucide-react';
import { useProducts, useProductCost } from '@/hooks/use-products';
import { useCreateQuote } from '@/hooks/use-quotes';
import { formatCurrency } from '@/lib/format';
import { DiscountType } from '@/types';

interface DraftItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

function ProductPicker({ onAdd }: { onAdd: (item: DraftItem) => void }) {
  const { data: products } = useProducts();
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const { data: pricing } = useProductCost(productId);

  const handleAdd = () => {
    if (!productId || !pricing) return;
    const product = products?.find((p) => p.id === productId);
    if (!product) return;

    onAdd({
      productId,
      productName: product.name,
      quantity: Number(quantity),
      unitPrice: pricing.finalPrice,
    });
    setProductId('');
    setQuantity('1');
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-end rounded-md border bg-slate-50 p-3">
      <div className="col-span-7 space-y-1">
        <Label className="text-xs">Produto</Label>
        <select
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option value="">Selecione um produto</option>
          {products?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-3 space-y-1">
        <Label className="text-xs">Quantidade</Label>
        <Input
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <div className="col-span-2">
        <Button type="button" onClick={handleAdd} disabled={!productId} className="w-full">
          Adicionar
        </Button>
      </div>
    </div>
  );
}

export default function NewQuotePage() {
  const router = useRouter();
  const createMutation = useCreateQuote();

  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [discountType, setDiscountType] = useState<DiscountType>('NONE');
  const [discountValue, setDiscountValue] = useState('0');
  const [validityDays, setValidityDays] = useState('7');
  const [notes, setNotes] = useState('');

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items]
  );

  const discountAmount = useMemo(() => {
    const value = Number(discountValue) || 0;
    if (discountType === 'PERCENT') return subtotal * (value / 100);
    if (discountType === 'FIXED') return Math.min(value, subtotal);
    return 0;
  }, [discountType, discountValue, subtotal]);

  const total = subtotal - discountAmount;

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!clientName.trim() || items.length === 0) return;

    const quote = await createMutation.mutateAsync({
      clientName: clientName.trim(),
      clientContact: clientContact.trim() || undefined,
      discountType,
      discountValue: Number(discountValue) || 0,
      validityDays: Number(validityDays) || 7,
      notes: notes.trim() || undefined,
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    });

    router.push(`/quotes/${quote.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Novo orçamento</h2>
        <p className="text-sm text-slate-500">
          Monte uma proposta comercial para um cliente, usando os preços já calculados
          dos seus produtos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SectionIntro>
            Este orçamento é um documento para enviar ao seu cliente, diferente do
            histórico interno de precificação. O preço de cada produto é travado no
            momento em que você cria o orçamento, então alterações futuras no custo do
            produto não mudam propostas já emitidas.
          </SectionIntro>

          <div className="space-y-2">
            <Label htmlFor="clientName">Nome do cliente *</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: Maria Silva"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientContact">Contato (opcional)</Label>
            <Input
              id="clientContact"
              value={clientContact}
              onChange={(e) => setClientContact(e.target.value)}
              placeholder="Telefone, e-mail ou WhatsApp"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Itens do orçamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ProductPicker onAdd={(item) => setItems((prev) => [...prev, item])} />
          {items.length > 0 && (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                >
                  <div>
                    <span className="font-medium">{item.productName}</span> —{' '}
                    {item.quantity} x {formatCurrency(item.unitPrice)} ={' '}
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Desconto e condições</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo de desconto</Label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
              >
                <option value="NONE">Sem desconto</option>
                <option value="PERCENT">Percentual (%)</option>
                <option value="FIXED">Valor fixo (R$)</option>
              </select>
            </div>
            {discountType !== 'NONE' && (
              <div className="space-y-2">
                <Label>Valor do desconto</Label>
                <Input
                  type="number"
                  step="any"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Validade da proposta (dias)</Label>
            <Input
              type="number"
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
            />
            <FieldHint>
              Por quantos dias, a partir de hoje, esta proposta permanece válida para o
              cliente. É só informativo — o sistema não bloqueia orçamentos vencidos.
            </FieldHint>
          </div>

          <div className="space-y-2">
            <Label>Observações (opcional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ex: prazo de entrega de 10 dias úteis, pagamento via PIX"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-900 bg-slate-50">
        <CardContent className="space-y-2 p-5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-red-700">
              <span>Desconto</span>
              <span>- {formatCurrency(discountAmount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold text-emerald-700">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/quotes')}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={createMutation.isPending || !clientName.trim() || items.length === 0}
        >
          {createMutation.isPending ? 'Gerando...' : 'Gerar orçamento'}
        </Button>
      </div>
    </div>
  );
}