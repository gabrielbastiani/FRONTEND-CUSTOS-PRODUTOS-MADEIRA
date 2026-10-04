'use client';

import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { AlertCircle, ArrowDown, ArrowUp, Minus } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProductCost, useProducts } from '@/hooks/use-products';
import { useMarketplaces } from '@/hooks/use-marketplace';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/format';
import type {
  ApiResponse,
  MarketplaceCalculationResult,
} from '@/types';

const NO_PRODUCT = '__no_product__';

function formatPercent(value: number): string {
  return `${Number.isFinite(value) ? value.toFixed(1) : '0.0'}%`;
}

function toNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function MarketplaceProfitability() {
  const { data: products, isLoading: isLoadingProducts } = useProducts();
  const { data: marketplaces, isLoading: isLoadingMarketplaces } =
    useMarketplaces();

  const [selectedProductId, setSelectedProductId] = useState(NO_PRODUCT);

  const activeMarketplaces = useMemo(
    () => (marketplaces ?? []).filter((marketplace) => marketplace.isActive),
    [marketplaces]
  );

  const selectedProduct =
    products?.find((product) => product.id === selectedProductId) ?? null;

  const { data: productPricing, isLoading: isLoadingProductCost, isError: isProductCostError } =
    useProductCost(
      selectedProductId === NO_PRODUCT ? '' : selectedProductId
    );

  const productCost = toNumber(productPricing?.subtotalCost);
  const desiredMarginPercent = toNumber(selectedProduct?.marginPercent);

  const marketplaceQueries = useQueries({
    queries: activeMarketplaces.map((marketplace) => ({
      queryKey: [
        'dashboard',
        'marketplace-calculation',
        selectedProductId,
        marketplace.id,
        productCost,
        desiredMarginPercent,
      ],
      queryFn: async () => {
        const { data } = await apiClient.post<
          ApiResponse<MarketplaceCalculationResult>
        >('/marketplace/calculate', {
          marketplaceId: marketplace.id,
          productCost,
          desiredMarginPercent,
        });

        return data.data;
      },
      enabled:
        selectedProductId !== NO_PRODUCT &&
        productCost > 0 &&
        Boolean(marketplace.isActive),
      staleTime: 60_000,
      retry: 1,
    })),
  });

  const results = activeMarketplaces
    .map((marketplace, index) => ({
      marketplace,
      result: marketplaceQueries[index]?.data,
      isLoading: marketplaceQueries[index]?.isLoading ?? false,
      isError: marketplaceQueries[index]?.isError ?? false,
    }))
    .filter(
      (
        item
      ): item is typeof item & {
        result: MarketplaceCalculationResult;
      } => Boolean(item.result)
    )
    .sort(
      (a, b) =>
        toNumber(b.result.effectiveMarginValue) -
        toNumber(a.result.effectiveMarginValue)
    );

  const hasMarketplaceErrors = marketplaceQueries.some(
    (query) => query.isError
  );

  const isCalculating = marketplaceQueries.some(
    (query) => query.isLoading
  );

  const bestResult = results[0]?.result;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Rentabilidade estimada por marketplace
        </CardTitle>
        <p className="text-sm text-slate-500">
          Compare o preço sugerido e o resultado estimado depois das taxas de
          cada canal. O cálculo usa o custo do produto e a margem cadastrada
          nele.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="max-w-xl space-y-2">
          <label
            htmlFor="dashboard-marketplace-product"
            className="text-sm font-medium"
          >
            Produto para comparar
          </label>

          <Select
            value={selectedProductId}
            onValueChange={setSelectedProductId}
            disabled={isLoadingProducts || !products?.length}
          >
            <SelectTrigger id="dashboard-marketplace-product">
              <SelectValue
  placeholder={
    isLoadingProducts
      ? 'Carregando produtos...'
      : 'Selecione um produto'
  }
>
  {selectedProduct?.name}
</SelectValue>
            </SelectTrigger>

            <SelectContent>
              {products?.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedProduct && (
            <p className="text-xs text-slate-500">
              Margem desejada: {formatPercent(desiredMarginPercent)}. Esta é a
              margem cadastrada para venda direta e será usada como meta no
              cálculo do marketplace; o cálculo continua considerando as taxas
              específicas de cada canal.
            </p>
          )}
        </div>

        {isLoadingMarketplaces && (
          <p className="text-sm text-slate-500">
            Carregando marketplaces...
          </p>
        )}

        {!isLoadingMarketplaces && activeMarketplaces.length === 0 && (
          <div className="rounded-md border border-dashed p-5 text-sm text-slate-600">
            Não há marketplaces ativos para comparar. Marketplaces inativos
            ficam fora desta análise.
          </div>
        )}

        {!isLoadingProducts && (!products || products.length === 0) && (
          <div className="rounded-md border border-dashed p-5 text-sm text-slate-600">
            Cadastre um produto antes de comparar a rentabilidade por
            marketplace.
          </div>
        )}

        {selectedProductId === NO_PRODUCT &&
          products &&
          products.length > 0 && (
            <div className="rounded-md border border-dashed p-5 text-sm text-slate-600">
              Selecione um produto para calcular o preço sugerido e comparar o
              resultado estimado nos marketplaces ativos.
            </div>
          )}

        {selectedProductId !== NO_PRODUCT && isLoadingProductCost && (
          <p className="text-sm text-slate-500">
            Carregando o custo calculado do produto...
          </p>
        )}

        {selectedProductId !== NO_PRODUCT && isProductCostError && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            Não foi possível carregar o custo do produto. Tente novamente ou
            confira o cadastro e a precificação dele.
          </div>
        )}

        {selectedProductId !== NO_PRODUCT &&
          !isLoadingProductCost &&
          !isProductCostError &&
          productCost <= 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              O custo calculado deste produto é zero ou inválido. Confira os
              materiais, a mão de obra e os custos indiretos antes de comparar
              os marketplaces.
            </div>
          )}

        {selectedProductId !== NO_PRODUCT &&
          productCost > 0 &&
          activeMarketplaces.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Custo usado no cálculo
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {formatCurrency(productCost)}
                  </p>
                </div>

                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Marketplaces ativos
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {activeMarketplaces.length}
                  </p>
                </div>

                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Maior resultado estimado
                  </p>
                  <p className="mt-1 text-lg font-semibold text-emerald-700">
                    {bestResult
                      ? formatCurrency(
                          toNumber(bestResult.effectiveMarginValue)
                        )
                      : isCalculating
                        ? 'Calculando...'
                        : '—'}
                  </p>
                </div>
              </div>

              {isCalculating && (
                <p className="text-sm text-slate-500">
                  Calculando preços e taxas dos marketplaces ativos...
                </p>
              )}

              {results.length > 0 && (
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Marketplace</th>
                        <th className="px-4 py-3 font-medium">
                          Preço sugerido
                        </th>
                        <th className="px-4 py-3 font-medium">
                          Total de taxas
                        </th>
                        <th className="px-4 py-3 font-medium">
                          Valor líquido recebido
                        </th>
                        <th className="px-4 py-3 font-medium">
                          Resultado estimado
                        </th>
                        <th className="px-4 py-3 font-medium">
                          Margem efetiva
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {results.map(({ marketplace, result }, index) => {
                        const effectiveMarginValue = toNumber(
                          result.effectiveMarginValue
                        );
                        const effectiveMarginPercent = toNumber(
                          result.effectiveMarginPercent
                        );
                        const isBest = index === 0;
                        const isBelowTarget =
                          effectiveMarginPercent < desiredMarginPercent;

                        return (
                          <tr
                            key={marketplace.id}
                            className={isBest ? 'bg-emerald-50/50' : ''}
                          >
                            <td className="px-4 py-3 font-medium text-slate-800">
                              <span className="flex items-center gap-2">
                                {marketplace.name}
                                {isBest && (
                                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                                    Maior resultado
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {formatCurrency(
                                toNumber(result.suggestedPrice)
                              )}
                            </td>
                            <td className="px-4 py-3 text-red-700">
                              {formatCurrency(toNumber(result.totalFees))}
                            </td>
                            <td className="px-4 py-3">
                              {formatCurrency(
                                toNumber(result.netReceivedByYou)
                              )}
                            </td>
                            <td
                              className={`px-4 py-3 font-medium ${
                                effectiveMarginValue < 0
                                  ? 'text-red-700'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {formatCurrency(effectiveMarginValue)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 ${
                                  effectiveMarginValue < 0
                                    ? 'text-red-700'
                                    : isBelowTarget
                                      ? 'text-amber-700'
                                      : 'text-emerald-700'
                                }`}
                              >
                                {effectiveMarginValue < 0 ? (
                                  <ArrowDown
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                ) : isBelowTarget ? (
                                  <Minus
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <ArrowUp
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                )}
                                {formatPercent(effectiveMarginPercent)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {hasMarketplaceErrors && (
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  Alguns cálculos falharam. Os resultados disponíveis continuam
                  sendo exibidos; confira a configuração das taxas e tente
                  novamente mais tarde.
                </div>
              )}

              {!isCalculating &&
                !hasMarketplaceErrors &&
                results.length === 0 && (
                  <div className="rounded-md border border-dashed p-5 text-sm text-slate-600">
                    Não foi possível obter resultados para este produto e os
                    marketplaces ativos.
                  </div>
                )}

              <p className="text-xs text-slate-500">
                “Resultado estimado” é o valor calculado após descontar o custo
                informado e as taxas configuradas do marketplace. Pode não
                incluir frete, impostos, embalagem, anúncios ou outras despesas
                que não estejam configuradas no sistema. Mantenha as taxas
                cadastradas atualizadas.
              </p>
            </>
          )}
      </CardContent>
    </Card>
  );
}