'use client';

import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  CircleDollarSign,
  Factory
} from 'lucide-react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { MarketplaceProfitability } from '@/components/dashboard/marketplace-profitability';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSuppliers } from '@/hooks/use-suppliers';
import { useRawMaterials } from '@/hooks/use-raw-materials';
import { useLaborRates } from '@/hooks/use-labor-rates';
import { useProducts } from '@/hooks/use-products';
import { useLowStockMaterials } from '@/hooks/use-raw-materials';
import { useBusinessBreakEven } from '@/hooks/use-business-break-even';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/format';
import type { ApiResponse, PricingResult, Product, ProductionRecord } from '@/types';

const COST_COLORS = ['#2563eb', '#16a34a', '#f59e0b'];

function toNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatProductionQuantity(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(value);
}

function LoadingMessage({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}

function EmptyChartMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-md border border-dashed p-6 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const suppliersQuery = useSuppliers();
  const materialsQuery = useRawMaterials();
  const laborRatesQuery = useLaborRates();
  const productsQuery = useProducts();
  const lowStockQuery = useLowStockMaterials();
  const breakEvenQuery = useBusinessBreakEven();

  const products = productsQuery.data ?? [];

  const productionHistoryQueries = useQueries({
    queries: products.map((product) => ({
      queryKey: ['products', product.id, 'production-history'],
      queryFn: async () => {
        const { data } = await apiClient.get<ApiResponse<ProductionRecord[]>>(
          `/products/${product.id}/production-history`
        );
        return data.data;
      },
      enabled: Boolean(product.id),
      staleTime: 60_000,
    })),
  });

  const productCostQueries = useQueries({
    queries: products.map((product) => ({
      queryKey: ['products', product.id, 'calculate'],
      queryFn: async () => {
        const { data } = await apiClient.get<ApiResponse<PricingResult>>(
          `/products/${product.id}/calculate`
        );
        return data.data;
      },
      enabled: Boolean(product.id),
      staleTime: 60_000,
    })),
  });

  const isLoadingProductCosts = productCostQueries.some(
    (query) => query.isLoading
  );

  const pricedProducts = products
    .map((product, index) => ({
      product,
      pricing: productCostQueries[index]?.data,
      hasError: productCostQueries[index]?.isError ?? false,
    }))
    .filter(
      (
        item
      ): item is {
        product: Product;
        pricing: PricingResult;
        hasError: boolean;
      } => Boolean(item.pricing)
    );

  const totalMaterialsCost = pricedProducts.reduce(
    (total, item) => total + toNumber(item.pricing.materialsCost),
    0
  );

  const totalLaborCost = pricedProducts.reduce(
    (total, item) => total + toNumber(item.pricing.laborCost),
    0
  );

  const totalOverheadCost = pricedProducts.reduce(
    (total, item) => total + toNumber(item.pricing.overheadCost),
    0
  );

  const totalCost =
    totalMaterialsCost + totalLaborCost + totalOverheadCost;

  const costChartData = [
    { name: 'Matérias-primas', value: totalMaterialsCost },
    { name: 'Mão de obra', value: totalLaborCost },
    { name: 'Custos indiretos', value: totalOverheadCost },
  ].filter((item) => item.value > 0);

  const productPriceData = pricedProducts
    .map(({ pricing }) => ({
      name: pricing.productName,
      price: toNumber(pricing.finalPrice),
      cost: toNumber(pricing.subtotalCost),
    }))
    .sort((a, b) => b.price - a.price)
    .slice(0, 8);

  const productsWithLowContribution = pricedProducts.filter(({ pricing }) => {
    const finalPrice = toNumber(pricing.finalPrice);
    if (finalPrice <= 0) return true;

    const contributionPercent =
      ((finalPrice -
        toNumber(pricing.materialsCost) -
        toNumber(pricing.laborCost)) /
        finalPrice) *
      100;

    return contributionPercent < 20;
  });

  const failedCostQueries = productCostQueries.filter(
    (query) => query.isError
  ).length;

  const lowStockMaterials = lowStockQuery.data ?? [];
  const breakEven = breakEvenQuery.data;

  const isLoadingProductionHistory = productionHistoryQueries.some(
    (query) => query.isLoading
  );

  const productionHistoryErrors = productionHistoryQueries.filter(
    (query) => query.isError
  ).length;

  const productionRecords = productionHistoryQueries.flatMap(
    (query, index) => {
      const product = products[index];
      if (!product || !query.data) return [];

      return query.data.map((record) => ({
        ...record,
        productName: product.name,
      }));
    }
  );

  const now = new Date();
  const currentMonthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const currentMonthProductionRecords = productionRecords.filter((record) => {
    const createdAt = new Date(record.createdAt);
    return (
      !Number.isNaN(createdAt.getTime()) &&
      createdAt >= currentMonthStart &&
      createdAt <= now
    );
  });

  const unitsProducedThisMonth = currentMonthProductionRecords.reduce(
    (total, record) => total + toNumber(record.quantityProduced),
    0
  );

  const productionCostThisMonth = currentMonthProductionRecords.reduce(
    (total, record) => total + toNumber(record.totalCost),
    0
  );

  const recentProductionRecords = [...productionRecords]
    .filter((record) => !Number.isNaN(new Date(record.createdAt).getTime()))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Visão geral da oficina
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Acompanhe seus cadastros, entenda de onde vêm os custos dos produtos e
          veja como está o ponto de equilíbrio do negócio.
        </p>
      </div>

      {products.length === 0 && !productsQuery.isLoading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center sm:p-10">
            <Boxes
              className="h-8 w-8 text-slate-400"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-slate-800">
                Cadastre seu primeiro produto
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Depois de adicionar materiais e mão de obra, o sistema poderá
                mostrar aqui a composição dos custos e o preço sugerido.
              </p>
            </div>
            <Link
              href="/products/new"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 underline"
            >
              Criar produto
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              De onde vêm os custos cadastrados?
            </CardTitle>
            <p className="text-sm text-slate-500">
              Soma dos custos calculados para os produtos cadastrados. Isso
              ajuda a comparar o peso dos materiais, do trabalho e dos custos
              indiretos.
            </p>
          </CardHeader>
          <CardContent>
            {isLoadingProductCosts ? (
              <LoadingMessage>
                Calculando os custos dos produtos...
              </LoadingMessage>
            ) : costChartData.length === 0 ? (
              <EmptyChartMessage>
                Ainda não há custos calculados para exibir. Confira se os
                produtos possuem materiais ou mão de obra cadastrados.
              </EmptyChartMessage>
            ) : (
              <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
                <div className="h-56 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={82}
                        paddingAngle={3}
                      >
                        {costChartData.map((item, index) => (
                          <Cell
                            key={item.name}
                            fill={COST_COLORS[index % COST_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) =>
                          formatCurrency(Number(value ?? 0))
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {costChartData.map((item, index) => {
                    const percent =
                      totalCost > 0 ? (item.value / totalCost) * 100 : 0;

                    return (
                      <div key={item.name} className="flex gap-3">
                        <span
                          className="mt-1 h-3 w-3 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              COST_COLORS[index % COST_COLORS.length],
                          }}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700">
                            {item.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatCurrency(item.value)} · {percent.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <p className="border-t pt-3 text-sm font-semibold text-slate-800">
                    Total: {formatCurrency(totalCost)}
                  </p>
                </div>
              </div>
            )}

            {failedCostQueries > 0 && (
              <p className="mt-4 flex items-start gap-2 text-xs text-amber-700">
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                Não foi possível calcular {failedCostQueries}{' '}
                {failedCostQueries === 1 ? 'produto' : 'produtos'}. Os gráficos
                consideram apenas os cálculos carregados com sucesso.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Produtos: custo e preço sugerido
            </CardTitle>
            <p className="text-sm text-slate-500">
              Compare o custo estimado de fabricação com o preço sugerido. O
              preço precisa cobrir os custos e deixar o resultado desejado.
            </p>
          </CardHeader>
          <CardContent>
            {isLoadingProductCosts ? (
              <LoadingMessage>
                Carregando preços e custos...
              </LoadingMessage>
            ) : productPriceData.length === 0 ? (
              <EmptyChartMessage>
                Não há preços calculados para comparar. Adicione componentes
                aos produtos e confira a tela de precificação.
              </EmptyChartMessage>
            ) : (
              <div className="space-y-4">
                {productPriceData.map((item) => {
                  const maxValue = Math.max(
                    ...productPriceData.map((product) => product.price),
                    1
                  );
                  const priceWidth = Math.max(
                    (item.price / maxValue) * 100,
                    2
                  );
                  const costWidth = Math.min(
                    (item.cost / maxValue) * 100,
                    100
                  );

                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between gap-3 text-xs">
                        <span
                          className="truncate font-medium text-slate-700"
                          title={item.name}
                        >
                          {item.name}
                        </span>
                        <span className="shrink-0 text-slate-500">
                          Custo {formatCurrency(item.cost)} · Preço{' '}
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                      <div
                        className="relative h-3 overflow-hidden rounded-full bg-slate-100"
                        aria-label={`${item.name}: custo ${formatCurrency(item.cost)} e preço sugerido ${formatCurrency(item.price)}`}
                      >
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-blue-600"
                          style={{ width: `${priceWidth}%` }}
                        />
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-amber-400 opacity-90"
                          style={{ width: `${costWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="flex flex-wrap gap-4 border-t pt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-amber-400" />
                    Custo estimado
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-blue-600" />
                    Preço sugerido
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <MarketplaceProfitability />

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Factory
                className="h-4 w-4 text-slate-500"
                aria-hidden="true"
              />
              Produção registrada
            </CardTitle>
            <p className="text-sm text-slate-500">
              Acompanhe as unidades produzidas e os custos registrados neste
              mês. Os valores são os gravados na data de cada produção e podem
              diferir dos custos atuais dos produtos.
            </p>
          </CardHeader>

          <CardContent>
            {isLoadingProductionHistory ? (
              <LoadingMessage>
                Carregando o histórico de produção...
              </LoadingMessage>
            ) : productionRecords.length === 0 ? (
              <EmptyChartMessage>
                Ainda não há produções registradas. Ao registrar uma produção
                na página de um produto, os indicadores e o histórico recente
                aparecerão aqui.
              </EmptyChartMessage>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">
                      Unidades produzidas neste mês
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {formatProductionQuantity(unitsProducedThisMonth)}
                    </p>
                  </div>

                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">
                      Custo de produção registrado neste mês
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {formatCurrency(productionCostThisMonth)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-medium text-slate-800">
                    Produções recentes
                  </h3>

                  <div className="space-y-3">
                    {recentProductionRecords.map((record) => (
                      <div
                        key={record.id}
                        className="flex flex-col gap-1 border-t pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                      >
                        <div className="min-w-0">
                          <p
                            className="truncate text-sm font-medium text-slate-800"
                            title={record.productName}
                          >
                            {record.productName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(record.createdAt).toLocaleDateString(
                              'pt-BR'
                            )}
                            {' · '}
                            {formatProductionQuantity(
                              toNumber(record.quantityProduced)
                            )}{' '}
                            {toNumber(record.quantityProduced) === 1
                              ? 'unidade'
                              : 'unidades'}
                          </p>
                        </div>

                        <div className="shrink-0 text-sm sm:text-right">
                          <p className="font-medium text-slate-800">
                            {formatCurrency(toNumber(record.totalCost))}
                          </p>
                          <p className="text-xs text-slate-500">
                            Custo registrado
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {productionHistoryErrors > 0 && (
              <p className="mt-4 flex items-start gap-2 text-xs text-amber-700">
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                Não foi possível carregar o histórico de produção de{' '}
                {productionHistoryErrors}{' '}
                {productionHistoryErrors === 1 ? 'produto' : 'produtos'}. Os
                indicadores consideram apenas os históricos carregados com
                sucesso.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Meta mensal para cobrir os custos fixos
            </CardTitle>
            <p className="text-sm text-slate-500">
              O ponto de equilíbrio é uma estimativa de quanto precisa entrar
              no mês para cobrir os custos fixos da oficina.
            </p>
          </CardHeader>
          <CardContent>
            {breakEvenQuery.isLoading ? (
              <LoadingMessage>
                Calculando o ponto de equilíbrio...
              </LoadingMessage>
            ) : breakEvenQuery.isError || !breakEven ? (
              <EmptyChartMessage>
                Não foi possível carregar o ponto de equilíbrio. Verifique se
                há custos fixos e dados de produção cadastrados.
              </EmptyChartMessage>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">
                      Valor estimado para cobrir os custos fixos
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {formatCurrency(
                        toNumber(breakEven.breakEvenRevenueMonthly)
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="text-slate-600">Progresso estimado</span>
                    <span className="font-medium text-slate-800">
                      {toNumber(breakEven.progressPercent).toFixed(1)}%
                    </span>
                  </div>
                  <div
                    className="h-3 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label="Progresso até cobrir os custos fixos do mês"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.min(
                      Math.max(toNumber(breakEven.progressPercent), 0),
                      100
                    )}
                  >
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all"
                      style={{
                        width: `${Math.min(
                          Math.max(toNumber(breakEven.progressPercent), 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <p className="text-sm text-slate-600">
                  {toNumber(breakEven.remainingRevenueToBreakEven) > 0
                    ? `Faltam aproximadamente ${formatCurrency(
                      toNumber(breakEven.remainingRevenueToBreakEven)
                    )} em vendas para atingir esse valor.`
                    : 'Pelos dados disponíveis, o valor estimado para cobrir os custos fixos já foi alcançado.'}
                </p>

                {breakEven.isEstimated && (
                  <p className="text-xs text-amber-700">
                    Esta estimativa usa a combinação de produtos e vendas
                    disponível no sistema. O resultado real pode variar.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CircleDollarSign
                className="h-4 w-4 text-slate-500"
                aria-hidden="true"
              />
              Itens para conferir
            </CardTitle>
            <p className="text-sm text-slate-500">
              Avisos que podem ajudar a identificar cadastros ou preços que
              merecem atenção.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-md border p-4">
              <div>
                <p className="font-medium text-slate-800">
                  Matérias-primas com estoque baixo
                </p>
                <p className="text-sm text-slate-500">
                  Itens que atingiram o alerta de estoque mínimo.
                </p>
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {lowStockQuery.isLoading
                  ? '—'
                  : lowStockMaterials.length}
              </span>
            </div>

            {lowStockMaterials.length > 0 && (
              <div className="space-y-2">
                {lowStockMaterials.slice(0, 5).map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="truncate text-slate-700">
                      {material.name}
                    </span>
                    <span className="shrink-0 text-amber-700">
                      Estoque: {toNumber(material.stockQty)}
                    </span>
                  </div>
                ))}
                <Link
                  href="/raw-materials"
                  className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-slate-900 underline"
                >
                  Ver matérias-primas
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            )}

            {pricedProducts.length > 0 && (
              <div className="rounded-md border p-4">
                <p className="font-medium text-slate-800">
                  Produtos com pouca margem de contribuição
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  A contribuição é o que sobra do preço após materiais e mão de
                  obra; essa sobra também precisa ajudar a cobrir custos
                  indiretos.
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {productsWithLowContribution.length}
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    de {pricedProducts.length} calculados
                  </span>
                </p>
                {productsWithLowContribution.length > 0 && (
                  <Link
                    href="/products"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-slate-900 underline"
                  >
                    Conferir produtos
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
            )}

            {lowStockQuery.isError && (
              <p className="text-sm text-amber-700">
                Não foi possível carregar os alertas de estoque neste momento.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}