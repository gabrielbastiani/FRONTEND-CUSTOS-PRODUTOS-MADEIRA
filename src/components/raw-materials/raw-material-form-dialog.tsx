'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RawMaterial, UNIT_LABELS, UnitOfMeasure } from '@/types';
import { useSuppliers } from '@/hooks/use-suppliers';
import {
  useCreateRawMaterial,
  useUpdateRawMaterial,
} from '@/hooks/use-raw-materials';
import { formatCurrency } from '@/lib/format';

const unitValues = Object.keys(UNIT_LABELS) as [UnitOfMeasure, ...UnitOfMeasure[]];

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  description: z.string().optional(),
  supplierId: z.string().optional(),
  purchaseUnit: z.enum(unitValues),
  purchaseQty: z.coerce.number().positive('Deve ser um valor positivo'),
  purchasePrice: z.coerce.number().nonnegative('Não pode ser negativo'),
  usageUnit: z.enum(unitValues),
  conversionFactor: z.coerce.number().positive('Deve ser um valor positivo'),
  minStockAlert: z.coerce.number().nonnegative().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rawMaterial?: RawMaterial | null;
}

export function RawMaterialFormDialog({ open, onOpenChange, rawMaterial }: Props) {
  const isEditing = !!rawMaterial;
  const { data: suppliers } = useSuppliers();
  const createMutation = useCreateRawMaterial();
  const updateMutation = useUpdateRawMaterial();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      supplierId: '',
      purchaseUnit: 'M',
      purchaseQty: 1,
      purchasePrice: 0,
      usageUnit: 'CM',
      conversionFactor: 100,
      minStockAlert: undefined,
    },
  });

  useEffect(() => {
    if (rawMaterial) {
      reset({
        name: rawMaterial.name,
        description: rawMaterial.description ?? '',
        supplierId: rawMaterial.supplierId ?? '',
        purchaseUnit: rawMaterial.purchaseUnit,
        purchaseQty: rawMaterial.purchaseQty,
        purchasePrice: rawMaterial.purchasePrice,
        usageUnit: rawMaterial.usageUnit,
        conversionFactor: rawMaterial.conversionFactor,
        minStockAlert: rawMaterial.minStockAlert ?? undefined,
      });
    } else {
      reset({
        name: '',
        description: '',
        supplierId: '',
        purchaseUnit: 'M',
        purchaseQty: 1,
        purchasePrice: 0,
        usageUnit: 'CM',
        conversionFactor: 100,
        minStockAlert: undefined,
      });
    }
  }, [rawMaterial, reset, open]);

  const purchaseQty = watch('purchaseQty');
  const purchasePrice = watch('purchasePrice');
  const conversionFactor = watch('conversionFactor');
  const usageUnit = watch('usageUnit');

  const totalUsageUnits = (purchaseQty || 0) * (conversionFactor || 0);
  const unitCost = totalUsageUnits > 0 ? (purchasePrice || 0) / totalUsageUnits : 0;

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      supplierId: values.supplierId || undefined,
    };

    if (isEditing && rawMaterial) {
      await updateMutation.mutateAsync({ id: rawMaterial.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar matéria-prima' : 'Nova matéria-prima'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register('name')} placeholder="Ex: Tábua de Pinus 20cm" />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register('description')} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Fornecedor</Label>
            <Select
              value={watch('supplierId') || undefined}
              onValueChange={(value) => setValue('supplierId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fornecedor (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {suppliers?.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border bg-slate-50 p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">
              Como foi comprado
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="purchaseQty">Quantidade comprada *</Label>
                <Input
                  id="purchaseQty"
                  type="number"
                  step="any"
                  {...register('purchaseQty')}
                  placeholder="Ex: 3"
                />
                {errors.purchaseQty && (
                  <p className="text-sm text-red-600">{errors.purchaseQty.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Unidade de compra *</Label>
                <Select
                  value={watch('purchaseUnit')}
                  onValueChange={(value) => setValue('purchaseUnit', value as UnitOfMeasure)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(UNIT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Preço pago (R$) *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="any"
                  {...register('purchasePrice')}
                  placeholder="Ex: 45.00"
                />
                {errors.purchasePrice && (
                  <p className="text-sm text-red-600">{errors.purchasePrice.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-md border bg-slate-50 p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">
              Como é usado na produção
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Unidade de uso *</Label>
                <Select
                  value={usageUnit}
                  onValueChange={(value) => setValue('usageUnit', value as UnitOfMeasure)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(UNIT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conversionFactor">
                  Quantas unidades de uso equivalem a 1 unidade de compra? *
                </Label>
                <Input
                  id="conversionFactor"
                  type="number"
                  step="any"
                  {...register('conversionFactor')}
                  placeholder="Ex: 100 (1 metro = 100 cm)"
                />
                {errors.conversionFactor && (
                  <p className="text-sm text-red-600">{errors.conversionFactor.message}</p>
                )}
              </div>
            </div>

            {totalUsageUnits > 0 && (
              <div className="mt-3 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                Custo calculado: <strong>{formatCurrency(unitCost)}</strong> por{' '}
                {UNIT_LABELS[usageUnit]?.toLowerCase()}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="minStockAlert">Alerta de estoque mínimo (opcional)</Label>
            <Input
              id="minStockAlert"
              type="number"
              step="any"
              {...register('minStockAlert')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}