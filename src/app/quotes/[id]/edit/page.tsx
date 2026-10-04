'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FieldHint } from '@/components/ui/field-hint';
import { SectionIntro } from '@/components/ui/section-intro';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2 } from 'lucide-react';
import { useProducts, useProductCost } from '@/hooks/use-products';
import { useQuote, useUpdateQuote } from '@/hooks/use-quotes';
import { formatCurrency } from '@/lib/format';
import { DiscountType } from '@/types';

interface EditableItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

function ProductPicker({ onAdd }: { onAdd: (item: EditableItem) => void }) {
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

export default function EditQuotePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: quote, isLoading } = useQuote(params.id);
  const updateMutation = useUpdateQuote(params.id);

  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [items, setItems] = useState<EditableItem[]>([]);
  const [discountType, setDiscountType] = useState<DiscountType>('NONE');
  const [discountValue, setDiscountValue] = useState('0');
  const [validityDays, setValidityDays] = useState('7');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!quote) return;
    setClientName(quote.clientName);
    setClientContact(quote.clientContact ?? '');
    setItems(
      quote.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))
    );
    setDiscountType(quote.discountType);
    setDiscountValue(String(quote.discountValue));
    setValidityDays(String(quote.validityDays));
    setNotes(quote.notes ?? '');
  }, [quote]);

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

  const handleItemFieldChange = (
    index: number,
    field: 'quantity' | 'unitPrice',
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: Number(value) || 0 } : item))
    );
  };

  const handleSubmit = async () => {
    if (!clientName.trim() || items.length === 0) return;

    await updateMutation.mutateAsync({
      clientName: clientName.trim(),
      clientContact: clientContact.trim() || null,
      discountType,
      discountValue: Number(discountValue) || 0,
      validityDays: Number(validityDays) || 7,
      notes: notes.trim() || null,
      items,
    });

    router.push(`/quotes/${params.id}`);
  };

  if (isLoading || !quote) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Editar orçamento</h2>
        <p className="text-sm text-slate-500">
          Ajuste qualquer dado desta proposta, incluindo itens, quantidades, preços e
          desconto.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SectionIntro>
            Você pode editar livremente qualquer campo desta proposta, incluindo o
            preço unitário de cada item, caso precise renegociar algo diretamente com o
            cliente.
          </SectionIntro>

          <div className="space-y-2">
            <Label htmlFor="clientName">Nome do cliente *</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
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
                <div key={index} className="grid grid-cols-12 items-center gap-2 rounded-md border p-3 text-sm">
                  <span className="col-span-4 font-medium">{item.productName}</span>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-xs">Quantidade</Label>
                    <Input
                      type="number"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => handleItemFieldChange(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-xs">Preço unitário</Label>
                    <Input
                      type="number"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => handleItemFieldChange(index, 'unitPrice', e.target.value)}
                    />
                  </div>
                  <span className="col-span-1 text-right font-medium">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="col-span-1"
                    onClick={() => handleRemoveItem(index)}
                  >
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
              Por quantos dias, a partir da emissão original, esta proposta permanece
              válida para o cliente.
            </FieldHint>
          </div>

          <div className="space-y-2">
            <Label>Observações (opcional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
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
        <Button variant="outline" onClick={() => router.push(`/quotes/${params.id}`)}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={updateMutation.isPending || !clientName.trim() || items.length === 0}
        >
          {updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  );
}