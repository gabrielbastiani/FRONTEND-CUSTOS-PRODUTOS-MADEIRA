'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FieldHint } from '@/components/ui/field-hint';
import { SectionIntro } from '@/components/ui/section-intro';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { useProducts } from '@/hooks/use-products';
import { useKit, useUpdateKit } from '@/hooks/use-kits';

interface DraftItem {
  productId: string;
  quantity: string;
}

export default function EditKitPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: kit, isLoading: loadingKit } = useKit(params.id);
  const { data: products, isLoading: loadingProducts } = useProducts();
  const updateMutation = useUpdateKit();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [marginPercent, setMarginPercent] = useState('30');
  const [overheadPercent, setOverheadPercent] = useState('0');
  const [items, setItems] = useState<DraftItem[]>([]);

  useEffect(() => {
    if (kit) {
      setName(kit.name);
      setDescription(kit.description ?? '');
      setMarginPercent(String(kit.marginPercent));
      setOverheadPercent(String(kit.overheadPercent));
      setItems(
        kit.items.map((item) => ({
          productId: item.productId,
          quantity: String(item.quantity),
        }))
      );
    }
  }, [kit]);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { productId: '', quantity: '1' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof DraftItem, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const productLabel = (productId: string) =>
    products?.find((p) => p.id === productId)?.name ?? 'Selecione um produto';

  const validItemsCount = items.filter((i) => i.productId).length;

  const handleSubmit = () => {
    if (!name.trim() || validItemsCount < 2) return;

    updateMutation.mutate(
      {
        id: params.id,
        payload: {
          name: name.trim(),
          description: description.trim() || undefined,
          marginPercent: parseFloat(marginPercent) || 0,
          overheadPercent: parseFloat(overheadPercent) || 0,
          items: items
            .filter((i) => i.productId)
            .map((i) => ({
              productId: i.productId,
              quantity: parseInt(i.quantity, 10) || 1,
            })),
        },
      },
      {
        onSuccess: () => router.push(`/kits/${params.id}`),
      }
    );
  };

  if (loadingKit) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!kit) {
    return <p className="text-sm text-slate-500">Kit não encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <SectionIntro>
        Edite os dados do kit, ajuste os produtos que o compõem e suas quantidades, ou
        modifique a margem de lucro definida para a venda combinada.
      </SectionIntro>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Editar kit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do kit</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Produtos do kit</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="mr-1 h-3 w-3" />
                Adicionar produto
              </Button>
            </div>

            {loadingProducts ? (
              <p className="text-sm text-slate-500">Carregando produtos...</p>
            ) : (
              items.map((item, index) => (
                <div key={index} className="flex items-end gap-2 rounded-md border p-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Produto</Label>
                    <Select
                      value={item.productId}
                      onValueChange={(value) => handleItemChange(index, 'productId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue>{productLabel(item.productId)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Quantidade</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    />
                  </div>
                  {items.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="overheadPercent">Custos indiretos do kit em % (opcional)</Label>
            <Input
              id="overheadPercent"
              type="number"
              step="any"
              value={overheadPercent}
              onChange={(e) => setOverheadPercent(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="marginPercent">Margem de lucro do kit (%)</Label>
            <Input
              id="marginPercent"
              type="number"
              step="any"
              value={marginPercent}
              onChange={(e) => setMarginPercent(e.target.value)}
            />
            <FieldHint>
              Margem aplicada sobre o custo total do kit, independente da margem de cada
              produto individual.
            </FieldHint>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending || !name.trim() || validItemsCount < 2}
            className="w-full"
          >
            {updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}