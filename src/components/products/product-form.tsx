'use client'

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FieldHint } from '@/components/ui/field-hint';
import { SectionIntro } from '@/components/ui/section-intro';
import { Trash2 } from 'lucide-react';
import { useCreateProduct } from '@/hooks/use-products';
import {
  ProductMaterialPicker,
  DraftMaterialItem,
} from './product-material-picker';
import { ProductLaborPicker, DraftLaborItem } from './product-labor-picker';
import { OverheadCostPicker, OverheadItem } from './overhead-cost-picker';
import { ProductImagePicker, DraftImageItem } from './product-image-picker';
import { uploadEntityImages } from '@/lib/upload-images';
import { formatCurrency } from '@/lib/format';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  description: z.string().optional(),
  marginPercent: z.coerce.number().min(0).max(1000),
});

type FormValues = z.infer<typeof schema>;

export function ProductForm() {
  const router = useRouter();
  const createMutation = useCreateProduct();

  const [materials, setMaterials] = useState<DraftMaterialItem[]>([]);
  const [labors, setLabors] = useState<DraftLaborItem[]>([]);
  const [overheadItems, setOverheadItems] = useState<OverheadItem[]>([]);
  const [draftImages, setDraftImages] = useState<DraftImageItem[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', marginPercent: 30 },
  });

  const marginPercent = watch('marginPercent') || 0;

  const handleRemoveMaterial = (index: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveLabor = (index: number) => {
    setLabors((prev) => prev.filter((_, i) => i !== index));
  };

  const preview = useMemo(() => {
    const materialsCost = materials.reduce((sum) => {
      return sum;
    }, 0);

    const laborCost = labors.reduce(
      (sum, item) => sum + item.hourlyRate * item.hoursSpent,
      0
    );

    const overheadCost = overheadItems.reduce((sum, item) => sum + item.value, 0);

    return { materialsCost, laborCost, overheadCost };
  }, [materials, labors, overheadItems]);

  const onSubmit = async (values: FormValues) => {
    const product = await createMutation.mutateAsync({
      name: values.name,
      description: values.description,
      marginPercent: values.marginPercent,
      overheadItems: overheadItems.map((item) => ({
        name: item.name,
        value: item.value,
      })),
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

    if (draftImages.length > 0) {
      setIsUploadingImages(true);
      try {
        await uploadEntityImages(
          'products',
          product.id,
          draftImages.map((item) => item.file)
        );
      } catch {
        // O produto já foi criado com sucesso; o envio de imagens pode
        // ser refeito depois na própria tela do produto, então não
        // bloqueamos a navegação por uma falha aqui.
      } finally {
        setIsUploadingImages(false);
      }
    }

    router.push(`/products/${product.id}`);
  };

  const estimatedLaborCost = labors.reduce((sum, l) => sum + l.hourlyRate * l.hoursSpent, 0);
  const estimatedOverhead = overheadItems.reduce((sum, item) => sum + item.value, 0);
  const isSubmitting = createMutation.isPending || isUploadingImages;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SectionIntro>
            Um produto é o item final que você vende, montado a partir de matérias-primas
            e mão de obra. Aqui você dá identidade a ele e define a margem de lucro que
            será aplicada sobre o custo total para chegar no preço de venda sugerido.
          </SectionIntro>

          <div className="space-y-2">
            <Label htmlFor="name">Nome do produto *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Caixa Organizadora de Madeira"
            />
            <FieldHint>
              Nome pelo qual você identifica e vende esse produto, por exemplo, para um
              catálogo ou etiqueta de preço.
            </FieldHint>
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register('description')} rows={2} />
            <FieldHint>
              Opcional. Detalhes sobre o produto, como medidas, acabamento ou variações,
              apenas para sua referência.
            </FieldHint>
          </div>
          <div className="space-y-2">
            <Label htmlFor="marginPercent">Margem de lucro (%)</Label>
            <Input
              id="marginPercent"
              type="number"
              step="any"
              {...register('marginPercent')}
            />
            <FieldHint>
              Percentual de lucro que você quer somar sobre o custo total do produto
              (materiais + mão de obra + custos indiretos) para chegar no preço final de
              venda. Por exemplo, uma margem de 30% sobre um custo de R$10 resulta em um
              preço final de R$13.
            </FieldHint>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Imagens do produto</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldHint className="mb-3">
            Adicione fotos do produto finalizado, opcional. Elas são enviadas
            automaticamente assim que você criar o produto, logo abaixo.
          </FieldHint>
          <ProductImagePicker items={draftImages} onChange={setDraftImages} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Matérias-primas utilizadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FieldHint>
            Adicione cada matéria-prima que entra na fabricação de uma unidade desse
            produto, informando a quantidade exata consumida. O custo de cada item é
            calculado automaticamente com base no preço de compra já cadastrado.
          </FieldHint>
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
          <FieldHint>
            Informe quais tipos de mão de obra são necessários para fabricar esse produto
            e quantas horas cada um demanda. O sistema multiplica automaticamente as horas
            pelo valor/hora cadastrado para calcular o custo de mão de obra.
          </FieldHint>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custos indiretos</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldHint className="mb-3">
            Adicione custos que não são de material nem de mão de obra direta, como
            energia elétrica, depreciação de ferramentas, embalagem ou transporte. Cada
            item é somado ao custo final do produto, proporcionalmente ao custo direto
            (materiais + mão de obra) já calculado.
          </FieldHint>
          <OverheadCostPicker items={overheadItems} onChange={setOverheadItems} />
        </CardContent>
      </Card>

      <Card className="border-slate-900 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-base">Prévia estimada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <FieldHint>
            Esta é uma estimativa parcial calculada no navegador. O custo de materiais
            depende de conversões feitas pelo servidor e será exibido com precisão total
            na tela do produto após salvar.
          </FieldHint>
          <Separator />
          <div className="flex justify-between">
            <span className="text-slate-600">Mão de obra</span>
            <span>{formatCurrency(estimatedLaborCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Custos indiretos</span>
            <span>{formatCurrency(estimatedOverhead)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Margem de lucro</span>
            <span>{marginPercent}%</span>
          </div>
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isUploadingImages
              ? 'Enviando imagens...'
              : 'Criando...'
            : 'Criar produto e calcular custo'}
        </Button>
      </div>
    </form>
  );
}