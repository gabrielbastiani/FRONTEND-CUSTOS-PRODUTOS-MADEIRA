'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { useCreateProduct } from '@/hooks/use-products';
import {
  ProductMaterialPicker,
  DraftMaterialItem,
} from './product-material-picker';
import { ProductLaborPicker, DraftLaborItem } from './product-labor-picker';
import { formatCurrency } from '@/lib/format';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  description: z.string().optional(),
  marginPercent: z.coerce.number().min(0).max(1000),
  overheadPercent: z.coerce.number().min(0).max(1000),
});

type FormValues = z.infer<typeof schema>;

export function ProductForm() {
  const router = useRouter();
  const createMutation = useCreateProduct();

  const [materials, setMaterials] = useState<DraftMaterialItem[]>([]);
  const [labors, setLabors] = useState<DraftLaborItem[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', marginPercent: 30, overheadPercent: 0 },
  });

  const handleRemoveMaterial = (index: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveLabor = (index: number) => {
    setLabors((prev) => prev.filter((_, i) => i !== index));
  };

  const estimatedLaborCost = labors.reduce((sum, l) => sum + l.hourlyRate * l.hoursSpent, 0);

  const onSubmit = async (values: FormValues) => {
    const product = await createMutation.mutateAsync({
      name: values.name,
      description: values.description,
      marginPercent: values.marginPercent,
      overheadPercent: values.overheadPercent,
      materials: materials.map((m) => ({
        rawMaterialId: m.rawMaterialId,
        quantityUsed: m.quantityUsed,
        wastePercent: m.wastePercent,
      })),
      labors: labors.map((l) => ({
        laborRateId: l.laborRateId,
        hoursSpent: l.hoursSpent,
      })),
    });

    router.push(`/products/${product.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do produto *</Label>
            <Input id="name" {...register('name')} placeholder="Ex: Caixa Organizadora de Madeira" />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register('description')} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="overheadPercent">Custos indiretos (%)</Label>
              <Input
                id="overheadPercent"
                type="number"
                step="any"
                {...register('overheadPercent')}
              />
              <p className="text-xs text-slate-500">
                Energia, aluguel, depreciação de ferramentas etc.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="marginPercent">Margem de lucro (%)</Label>
              <Input
                id="marginPercent"
                type="number"
                step="any"
                {...register('marginPercent')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Matérias-primas utilizadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ProductMaterialPicker onAdd={(item) => setMaterials((prev) => [...prev, item])} />
          {materials.length > 0 && (
            <div className="space-y-2">
              {materials.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                >
                  <div>
                    <span className="font-medium">{item.name}</span> — {item.quantityUsed}{' '}
                    {item.usageUnitLabel.toLowerCase()} (desperdício: {item.wastePercent}%)
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMaterial(index)}
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
          <CardTitle className="text-base">Mão de obra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ProductLaborPicker onAdd={(item) => setLabors((prev) => [...prev, item])} />
          {labors.length > 0 && (
            <div className="space-y-2">
              {labors.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                >
                  <div>
                    <span className="font-medium">{item.name}</span> — {item.hoursSpent}h x{' '}
                    {formatCurrency(item.hourlyRate)}/h ={' '}
                    {formatCurrency(item.hourlyRate * item.hoursSpent)}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLabor(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
              <p className="text-right text-sm font-medium text-slate-700">
                Total estimado de mão de obra: {formatCurrency(estimatedLaborCost)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/products')}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Criando...' : 'Criar produto e calcular custo'}
        </Button>
      </div>
    </form>
  );
}