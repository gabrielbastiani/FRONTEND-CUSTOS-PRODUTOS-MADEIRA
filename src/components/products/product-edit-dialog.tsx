'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { FieldHint } from '@/components/ui/field-hint';
import { SectionIntro } from '@/components/ui/section-intro';
import { OverheadModeSelector } from './overhead-mode-selector';
import { OverheadItem } from './overhead-cost-picker';
import { ImageUploader } from '@/components/shared/image-uploader';
import { Product, OverheadMode } from '@/types';
import { useUpdateProductDetails } from '@/hooks/use-products';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  description: z.string().optional(),
  marginPercent: z.coerce.number().min(0).max(1000),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function ProductEditDialog({ open, onOpenChange, product }: Props) {
  const updateMutation = useUpdateProductDetails(product.id);
  const [overheadMode, setOverheadMode] = useState<OverheadMode>(product.overheadMode);
  const [overheadItems, setOverheadItems] = useState<OverheadItem[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product.name,
      description: product.description ?? '',
      marginPercent: product.marginPercent,
    },
  });

  const productionTimeHours = useMemo(
    () => product.labors.reduce((sum, item) => sum + Number(item.hoursSpent), 0),
    [product.labors]
  );

  useEffect(() => {
    if (open) {
      reset({
        name: product.name,
        description: product.description ?? '',
        marginPercent: product.marginPercent,
      });
      setOverheadMode(product.overheadMode);
      setOverheadItems(
        product.overheadItems.map((item) => ({ name: item.name, value: item.value }))
      );
    }
  }, [open, product, reset]);

  const onSubmit = async (values: FormValues) => {
    await updateMutation.mutateAsync({
      name: values.name,
      description: values.description,
      marginPercent: values.marginPercent,
      overheadMode,
      overheadItems: overheadItems.map((item) => ({
        name: item.name,
        value: item.value,
      })),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar produto</DialogTitle>
        </DialogHeader>

        <SectionIntro>
          Aqui você atualiza as informações gerais do produto, ajusta os custos
          indiretos vinculados a ele e gerencia as fotos do produto. Alterações na
          margem de lucro e nos custos indiretos recalculam automaticamente o preço
          final sugerido, refletido assim que você salvar.
        </SectionIntro>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome do produto *</Label>
            <Input id="edit-name" {...register('name')} />
            <FieldHint>
              Nome pelo qual você identifica e vende esse produto.
            </FieldHint>
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea id="edit-description" {...register('description')} rows={2} />
            <FieldHint>
              Opcional. Detalhes sobre o produto, como medidas, acabamento ou variações,
              apenas para sua referência.
            </FieldHint>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-margin">Margem de lucro (%)</Label>
            <Input
              id="edit-margin"
              type="number"
              step="any"
              {...register('marginPercent')}
            />
            <FieldHint>
              Percentual de lucro somado sobre o custo total do produto (materiais + mão
              de obra + custos indiretos) para chegar no preço final de venda.
            </FieldHint>
            {errors.marginPercent && (
              <p className="text-sm text-red-600">{errors.marginPercent.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Custos indiretos</Label>
            <FieldHint>
              Escolha entre cadastrar itens manuais (energia, depreciação de
              ferramentas etc.) ou usar o rateio automático baseado na capacidade
              produtiva da oficina e nos custos fixos mensais cadastrados em
              Configurações da oficina.
            </FieldHint>
            <OverheadModeSelector
              mode={overheadMode}
              onModeChange={setOverheadMode}
              overheadItems={overheadItems}
              onOverheadItemsChange={setOverheadItems}
              productionTimeHours={productionTimeHours}
            />
          </div>

          <div className="space-y-2">
            <Label>Imagens do produto</Label>
            <FieldHint>
              Adicione ou remova fotos do produto finalizado, útil para catálogo ou
              referência visual. As alterações aqui são salvas imediatamente, sem
              precisar clicar em "Salvar alterações".
            </FieldHint>
            <ImageUploader ownerType="products" ownerId={product.id} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}