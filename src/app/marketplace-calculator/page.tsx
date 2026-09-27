'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FieldHint } from '@/components/ui/field-hint';
import { SectionIntro } from '@/components/ui/section-intro';
import { useProducts, useProductCost } from '@/hooks/use-products';
import { useKits, useKitCost } from '@/hooks/use-kits';
import {
  useCalculateMarketplacePrice,
  useMarketplaces,
} from '@/hooks/use-marketplace';
import { formatCurrency } from '@/lib/format';

type CostSource = 'PRODUCT' | 'KIT' | 'MANUAL';

const NO_PRODUCT_VALUE = '__none__';
const NO_PRODUCT_LABEL = 'Selecione um produto';
const NO_KIT_VALUE = '__none__';
const NO_KIT_LABEL = 'Selecione um kit';

export default function MarketplaceCalculatorPage() {
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: kits, isLoading: loadingKits } = useKits();
  const { data: marketplaces, isLoading: loadingMarketplaces } = useMarketplaces();

  const [marketplaceId, setMarketplaceId] = useState<string>('');
  const [costSource, setCostSource] = useState<CostSource>('PRODUCT');
  const [selectedProductId, setSelectedProductId] = useState<string>(NO_PRODUCT_VALUE);
  const [selectedKitId, setSelectedKitId] = useState<string>(NO_KIT_VALUE);
  const [manualCost, setManualCost] = useState<string>('');
  const [marginPercent, setMarginPercent] = useState<string>('30');

  const calculateMutation = useCalculateMarketplacePrice();

  useEffect(() => {
    if (!marketplaceId && marketplaces && marketplaces.length > 0) {
      setMarketplaceId(marketplaces[0].id);
    }
  }, [marketplaces, marketplaceId]);

  const { data: productPricing, isLoading: loadingProductPricing } = useProductCost(
    costSource === 'PRODUCT' && selectedProductId !== NO_PRODUCT_VALUE
      ? selectedProductId
      : ''
  );

  const { data: kitPricing, isLoading: loadingKitPricing } = useKitCost(
    costSource === 'KIT' && selectedKitId !== NO_KIT_VALUE ? selectedKitId : ''
  );

  const loadingCost = loadingProductPricing || loadingKitPricing;

  const effectiveCost = useMemo(() => {
    if (costSource === 'PRODUCT') {
      return productPricing?.subtotalCost ?? 0;
    }
    if (costSource === 'KIT') {
      return kitPricing?.subtotalCost ?? 0;
    }
    return parseFloat(manualCost) || 0;
  }, [costSource, productPricing, kitPricing, manualCost]);

  const selectedProductLabel =
    selectedProductId === NO_PRODUCT_VALUE
      ? NO_PRODUCT_LABEL
      : products?.find((p) => p.id === selectedProductId)?.name ?? NO_PRODUCT_LABEL;

  const selectedKitLabel =
    selectedKitId === NO_KIT_VALUE
      ? NO_KIT_LABEL
      : kits?.find((k) => k.id === selectedKitId)?.name ?? NO_KIT_LABEL;

  const selectedMarketplaceLabel =
    marketplaces?.find((m) => m.id === marketplaceId)?.name ?? 'Selecione um marketplace';

  const handleCalculate = () => {
    if (effectiveCost <= 0 || !marketplaceId) return;

    calculateMutation.mutate({
      marketplaceId,
      productCost: effectiveCost,
      desiredMarginPercent: parseFloat(marginPercent) || 0,
    });
  };

  const result = calculateMutation.data;

  return (
    <div className="space-y-6">
      <SectionIntro>
        Esta calculadora estima o preço final de venda que você precisa cobrar em cada
        marketplace para que, mesmo após o desconto de todas as taxas da plataforma,
        sobre exatamente a margem de lucro que você deseja sobre o custo do produto ou
        kit escolhido.
      </SectionIntro>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados para o cálculo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Marketplace</Label>
            {loadingMarketplaces ? (
              <Skeleton className="h-9 w-full" />
            ) : marketplaces && marketplaces.length > 0 ? (
              <Select value={marketplaceId} onValueChange={setMarketplaceId}>
                <SelectTrigger>
                  <SelectValue>{selectedMarketplaceLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {marketplaces.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-slate-500">
                Nenhum marketplace cadastrado ainda. Adicione um na tela &quot;Taxas de
                Marketplace&quot;.
              </p>
            )}
            <FieldHint>
              Cada marketplace tem uma estrutura de taxas diferente. Selecione para onde
              você pretende anunciar este produto ou kit.
            </FieldHint>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>O que você está precificando?</Label>
            <Select
              value={costSource}
              onValueChange={(value) => setCostSource(value as CostSource)}
            >
              <SelectTrigger>
                <SelectValue>
                  {costSource === 'PRODUCT'
                    ? 'Um produto individual'
                    : costSource === 'KIT'
                      ? 'Um kit de produtos'
                      : 'Custo digitado manualmente'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRODUCT">Um produto individual</SelectItem>
                <SelectItem value="KIT">Um kit de produtos</SelectItem>
                <SelectItem value="MANUAL">Custo digitado manualmente</SelectItem>
              </SelectContent>
            </Select>
            <FieldHint>
              Escolha se você quer calcular o preço de venda de um único produto, de um
              kit que agrupa vários produtos, ou se prefere digitar um custo manualmente
              sem usar nenhum cadastro.
            </FieldHint>
          </div>

          {costSource === 'PRODUCT' && (
            <div className="space-y-2">
              <Label>Produto cadastrado</Label>
              {loadingProducts ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue>{selectedProductLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_PRODUCT_VALUE}>{NO_PRODUCT_LABEL}</SelectItem>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FieldHint>
                O sistema usa automaticamente o custo total já calculado do produto
                (materiais + mão de obra + custos indiretos, sem a margem própria dele).
              </FieldHint>
            </div>
          )}

          {costSource === 'KIT' && (
            <div className="space-y-2">
              <Label>Kit cadastrado</Label>
              {loadingKits ? (
                <Skeleton className="h-9 w-full" />
              ) : kits && kits.length > 0 ? (
                <Select value={selectedKitId} onValueChange={setSelectedKitId}>
                  <SelectTrigger>
                    <SelectValue>{selectedKitLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_KIT_VALUE}>{NO_KIT_LABEL}</SelectItem>
                    {kits.map((kit) => (
                      <SelectItem key={kit.id} value={kit.id}>
                        {kit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-slate-500">
                  Nenhum kit cadastrado ainda. Crie um na tela &quot;Kits de
                  Produtos&quot; antes de calcular o preço aqui.
                </p>
              )}
              <FieldHint>
                O custo usado será o custo combinado dos produtos do kit (já
                considerando a quantidade de cada um e os custos indiretos do próprio
                kit), sem a margem própria do kit.
              </FieldHint>
            </div>
          )}

          {costSource === 'MANUAL' && (
            <div className="space-y-2">
              <Label htmlFor="manualCost">Custo do produto ou kit (R$)</Label>
              <Input
                id="manualCost"
                type="number"
                step="any"
                value={manualCost}
                onChange={(e) => setManualCost(e.target.value)}
                placeholder="Ex: 25.00"
              />
              <FieldHint>
                Custo total de produção de uma unidade (ou do kit inteiro), sem incluir
                a margem de lucro.
              </FieldHint>
            </div>
          )}

          {(costSource === 'PRODUCT' && selectedProductId !== NO_PRODUCT_VALUE) && (
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
              {loadingCost ? (
                <Skeleton className="h-5 w-40" />
              ) : (
                <div className="space-y-1">
                  <p>
                    Custo total do produto selecionado:{' '}
                    <strong>{formatCurrency(effectiveCost)}</strong>
                  </p>
                  {productPricing && (
                    <p className="text-xs text-slate-500">
                      Margem cadastrada no produto (venda direta, não usada neste
                      cálculo):{' '}
                      <strong>{productPricing.breakdown.marginPercent}%</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {(costSource === 'KIT' && selectedKitId !== NO_KIT_VALUE) && (
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
              {loadingCost ? (
                <Skeleton className="h-5 w-40" />
              ) : (
                <div className="space-y-1">
                  <p>
                    Custo total do kit selecionado:{' '}
                    <strong>{formatCurrency(effectiveCost)}</strong>
                  </p>
                  {kitPricing && (
                    <>
                      <p className="text-xs text-slate-500">
                        Composto por:{' '}
                        {kitPricing.items
                          .map((item) => `${item.productName} (x${item.quantity})`)
                          .join(', ')}
                      </p>
                      <p className="text-xs text-slate-500">
                        Margem cadastrada no kit (venda direta, não usada neste
                        cálculo): <strong>{kitPricing.marginPercent}%</strong>
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3">
              <span className="mt-0.5 text-amber-600">⚠</span>
              <p className="text-xs text-amber-800">
                <strong>Atenção:</strong> esta margem é totalmente independente da
                margem de lucro cadastrada no produto ou no kit. Essa margem cadastrada
                vale apenas para venda direta, fora de marketplace. Aqui você define a
                margem que quer obter especificamente nesta plataforma, depois de
                descontadas as taxas dela — o cálculo parte do custo puro, sem
                considerar a margem do cadastro.
              </p>
            </div>

            <Label htmlFor="marginPercent">Margem de lucro desejada (%)</Label>
            <Input
              id="marginPercent"
              type="number"
              step="any"
              value={marginPercent}
              onChange={(e) => setMarginPercent(e.target.value)}
            />
            <FieldHint>
              Percentual de lucro que você quer garantir sobre o custo, depois de já
              descontadas todas as taxas do marketplace.
            </FieldHint>
          </div>

          <Button
            onClick={handleCalculate}
            disabled={calculateMutation.isPending || effectiveCost <= 0 || !marketplaceId}
            className="w-full"
          >
            {calculateMutation.isPending ? 'Calculando...' : 'Calcular preço de venda'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-slate-900 bg-slate-50">
          <CardHeader>
            <CardTitle className="text-base">
              Resultado para {result.marketplaceName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md bg-emerald-50 p-4 text-center">
              <p className="text-sm text-emerald-700">Preço final de venda sugerido</p>
              <p className="text-3xl font-bold text-emerald-800">
                {formatCurrency(result.suggestedPrice)}
              </p>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Custo do produto ou kit</span>
                <span>{formatCurrency(result.productCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Comissão da plataforma ({result.commissionPercent}%)
                </span>
                <span className="text-red-600">
                  − {formatCurrency(result.commissionValue)}
                </span>
              </div>
              {result.fixedFeeValue > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Taxa fixa por venda</span>
                  <span className="text-red-600">
                    − {formatCurrency(result.fixedFeeValue)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Total de taxas descontadas</span>
                <span className="text-red-600">
                  − {formatCurrency(result.totalFees)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-slate-600">Valor líquido que você recebe</span>
                <span>{formatCurrency(result.netReceivedByYou)}</span>
              </div>
              <div className="flex justify-between font-medium text-emerald-700">
                <span>Lucro efetivo</span>
                <span>
                  {formatCurrency(result.effectiveMarginValue)} (
                  {result.effectiveMarginPercent}%)
                </span>
              </div>
            </div>

            <FieldHint>
              As taxas usadas neste cálculo podem ser ajustadas na tela de configuração
              de taxas de marketplace, caso a plataforma altere seus percentuais ou você
              identifique uma taxa de categoria diferente da configurada.
            </FieldHint>
          </CardContent>
        </Card>
      )}
    </div>
  );
}