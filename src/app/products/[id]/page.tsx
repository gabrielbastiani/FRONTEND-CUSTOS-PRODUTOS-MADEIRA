'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, Save, Trash2 } from 'lucide-react';
import {
  useProduct,
  useProductCost,
  useProductHistory,
  useSaveCostSnapshot,
  useRemoveMaterialFromProduct,
  useRemoveLaborFromProduct,
  useAddMaterialToProduct,
  useAddLaborToProduct,
} from '@/hooks/use-products';
import { useProductionHistory } from '@/hooks/use-production';
import { CostBreakdown } from '@/components/products/cost-breakdown';
import {
  ProductMaterialPicker,
  DraftMaterialItem,
} from '@/components/products/product-material-picker';
import { ProductLaborPicker, DraftLaborItem } from '@/components/products/product-labor-picker';
import { ProductEditDialog } from '@/components/products/product-edit-dialog';
import { ProductionForm } from '@/components/products/production-form';
import { ProductionHistory } from '@/components/products/production-history';
import { formatCurrency, formatDate } from '@/lib/format';
import { UNIT_LABELS } from '@/types';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = params.id;

  const { data: product, isLoading: loadingProduct } = useProduct(productId);
  const { data: pricing, isLoading: loadingPricing } = useProductCost(productId);
  const { data: history } = useProductHistory(productId);
  const { data: productionRecords } = useProductionHistory(productId);

  const saveSnapshotMutation = useSaveCostSnapshot(productId);
  const removeMaterialMutation = useRemoveMaterialFromProduct(productId);
  const removeLaborMutation = useRemoveLaborFromProduct(productId);
  const addMaterialMutation = useAddMaterialToProduct(productId);
  const addLaborMutation = useAddLaborToProduct(productId);

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleAddMaterial = (item: DraftMaterialItem) => {
    addMaterialMutation.mutate({
      rawMaterialId: item.rawMaterialId,
      quantityUsed: item.quantityUsed,
      wastePercent: item.wastePercent,
    });
  };

  const handleAddLabor = (item: DraftLaborItem) => {
    addLaborMutation.mutate({
      laborRateId: item.laborRateId,
      hoursSpent: item.hoursSpent,
    });
  };

  if (loadingProduct || !product) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/products')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar produto
          </Button>
          <Button
            onClick={() => saveSnapshotMutation.mutate()}
            disabled={saveSnapshotMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar precificação no histórico
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">{product.name}</h2>
        {product.description && (
          <p className="text-sm text-slate-500">{product.description}</p>
        )}
      </div>

      <Card className="border-2 border-emerald-600 bg-emerald-50">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-emerald-700">Preço final sugerido</p>
            {loadingPricing || !pricing ? (
              <Skeleton className="mt-1 h-8 w-32" />
            ) : (
              <p className="text-3xl font-bold text-emerald-800">
                {formatCurrency(pricing.finalPrice)}
              </p>
            )}
          </div>
          {pricing && (
            <div className="text-right text-sm text-emerald-700">
              <p>Custo total: {formatCurrency(pricing.subtotalCost)}</p>
              <p>Margem: {pricing.breakdown.marginPercent}%</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="cost">
        <TabsList>
          <TabsTrigger value="cost">Custo atual</TabsTrigger>
          <TabsTrigger value="composition">Composição</TabsTrigger>
          <TabsTrigger value="production">Produção</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="cost" className="mt-4">
          {loadingPricing || !pricing ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <CostBreakdown pricing={pricing} />
          )}
        </TabsContent>

        <TabsContent value="composition" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Matérias-primas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProductMaterialPicker onAdd={handleAddMaterial} />
              <div className="space-y-2">
                {product.materials.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border p-3 text-sm"
                  >
                    <div>
                      <span className="font-medium">{item.rawMaterial.name}</span> —{' '}
                      {item.quantityUsed} {UNIT_LABELS[item.rawMaterial.usageUnit].toLowerCase()}{' '}
                      (desperdício: {item.wastePercent}%)
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMaterialMutation.mutate(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mão de obra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProductLaborPicker onAdd={handleAddLabor} />
              <div className="space-y-2">
                {product.labors.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border p-3 text-sm"
                  >
                    <div>
                      <span className="font-medium">{item.laborRate.name}</span> —{' '}
                      {item.hoursSpent}h x {formatCurrency(item.laborRate.hourlyRate)}/h
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLaborMutation.mutate(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Custos indiretos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!product.overheadItems || product.overheadItems.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhum custo indireto cadastrado. Clique em &quot;Editar produto&quot; no
                  topo da página para adicionar itens como energia, embalagem ou depreciação
                  de ferramentas.
                </p>
              ) : (
                <>
                  {product.overheadItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border p-3 text-sm"
                    >
                      <span className="font-medium">{item.name}</span>
                      <span>{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                  <p className="text-right text-sm font-medium text-slate-700">
                    Total de custos indiretos:{' '}
                    {formatCurrency(
                      product.overheadItems.reduce((sum, item) => sum + item.value, 0)
                    )}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="mt-4 space-y-4">
          <ProductionForm productId={productId} />
          <ProductionHistory records={productionRecords ?? []} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {!history || history.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-slate-500">
              Nenhum snapshot de precificação salvo ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((snapshot) => (
                <Card key={snapshot.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm text-slate-500">
                        {formatDate(snapshot.createdAt)}
                      </p>
                      <p className="text-lg font-bold text-emerald-700">
                        {formatCurrency(snapshot.finalPrice)}
                      </p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <p>Materiais: {formatCurrency(snapshot.materialsCost)}</p>
                      <p>Mão de obra: {formatCurrency(snapshot.laborCost)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ProductEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        product={product}
      />
    </div>
  );
}