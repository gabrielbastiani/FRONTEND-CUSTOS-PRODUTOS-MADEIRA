'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
import { useCreateKit } from '@/hooks/use-kits';

interface DraftItem {
  productId: string;
  quantity: string;
}

export default function NewKitPage() {
  const router = useRouter();
  const { data: products, isLoading: loadingProducts } = useProducts();
  const createMutation = useCreateKit();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [marginPercent, setMarginPercent] = useState('30');
  const [overheadPercent, setOverheadPercent] = useState('0');
  const [items, setItems] = useState<DraftItem[]>([
    { productId: '', quantity: '1' },
    { productId: '', quantity: '1' },
  ]);

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

    createMutation.mutate(
      {
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
      {
        onSuccess: (kit) => {
          if (kit) router.push(`/kits/${kit.id}`);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <SectionIntro>
        Selecione ao menos dois produtos já cadastrados e a quantidade de cada um para
        formar o kit. O custo é calculado automaticamente somando o custo de cada
        produto pela quantidade escolhida.
      </SectionIntro>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do kit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do kit</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Kit Suporte Papel Toalha + Guardanapos"
            />
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
            <FieldHint>
              Escolha ao menos dois produtos já cadastrados e a quantidade de cada um
              dentro do kit.
            </FieldHint>

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
            <FieldHint>
              Percentual aplicado sobre a soma do custo dos produtos, para cobrir custos
              extras específicos de vender o conjunto (ex: embalagem especial do kit).
              Deixe 0 se não houver custo indireto adicional além do que já está em cada
              produto.
            </FieldHint>
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
              Margem aplicada sobre o custo total do kit. Pode ser diferente da margem
              de cada produto individual — muitas vezes vale a pena vender o kit com uma
              margem um pouco menor para incentivar a compra combinada.
            </FieldHint>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || !name.trim() || validItemsCount < 2}
            className="w-full"
          >
            {createMutation.isPending ? 'Criando...' : 'Criar kit'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}