'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FieldHint } from '@/components/ui/field-hint';
import { SectionIntro } from '@/components/ui/section-intro';
import { useBusinessBreakEven } from '@/hooks/use-business-break-even';
import { formatCurrency, formatNumber } from '@/lib/format';

export default function BusinessGoalPage() {
  const { data: breakEven, isLoading } = useBusinessBreakEven();

  if (isLoading || !breakEven) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const progressCapped = Math.min(breakEven.progressPercent, 100);
  const progressColor = breakEven.isOnTrack ? 'bg-emerald-600' : 'bg-amber-500';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Meta do negócio</h2>
        <p className="text-sm text-slate-500">
          Quanto você precisa faturar este mês, somando todos os produtos, para cobrir
          os custos fixos do negócio — e como você está indo até agora.
        </p>
      </div>

      <Card className="border-slate-900">
        <CardHeader>
          <CardTitle className="text-base">Meta de faturamento mensal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <SectionIntro>
            Diferente do ponto de equilíbrio de um produto específico, esta conta
            considera que você vende vários produtos diferentes ao longo do mês, cada
            um com sua própria margem. Ela responde: &quot;juntando tudo o que eu vendo,
            quanto preciso faturar por mês só para pagar as contas fixas do negócio,
            antes de sobrar qualquer lucro de verdade?&quot;
          </SectionIntro>

          {breakEven.isEstimated && (
            <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-800">
              Ainda não há produção registrada nos últimos 30 dias, então este valor é
              uma estimativa baseada na margem média de todos os produtos cadastrados,
              não no que você realmente costuma vender. Assim que você registrar
              produções, o cálculo passa a refletir seu mix real de vendas.
            </p>
          )}

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Custo fixo mensal total do negócio</span>
              <span className="font-medium">
                {formatCurrency(breakEven.totalFixedCostMonthly)}
              </span>
            </div>
            <FieldHint>
              Soma de tudo que você paga todo mês, independente de vender muito ou
              pouco: aluguel, energia, internet e outros itens cadastrados em
              Configurações da oficina.
            </FieldHint>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">
                Margem de contribuição média do seu mix de produtos
              </span>
              <span className="font-medium">
                {formatNumber(breakEven.weightedContributionMarginPercent)}%
              </span>
            </div>
            <FieldHint>
              É, em média, qual fatia percentual de cada venda sobra depois de pagar
              material e mão de obra, considerando o quanto cada produto pesa no que
              você efetivamente vende. Produtos que você vende mais influenciam mais
              essa média do que produtos vendidos raramente.
            </FieldHint>
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between text-lg font-bold text-emerald-700">
              <span>Faturamento necessário este mês</span>
              <span>{formatCurrency(breakEven.breakEvenRevenueMonthly)}</span>
            </div>
            <FieldHint>
              Este é o número-alvo: se você faturar isso ao longo do mês (somando todas
              as vendas de todos os produtos), você cobre exatamente os custos fixos do
              negócio. Faturar mais que isso é a partir de onde entra o lucro de
              verdade.
            </FieldHint>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como você está indo este mês</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Faturado até agora no mês</span>
              <span className="font-medium">
                {formatCurrency(breakEven.currentMonthRevenue)}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full ${progressColor} transition-all`}
                style={{ width: `${progressCapped}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {formatNumber(breakEven.progressPercent)}% da meta de faturamento deste
              mês já alcançado ({breakEven.currentMonthUnits} unidades produzidas até
              agora).
            </p>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-slate-600">Falta faturar para bater a meta</span>
            <span className="font-medium">
              {formatCurrency(breakEven.remainingRevenueToBreakEven)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-600">
              Projeção de faturamento ao final do mês
            </span>
            <span className="font-medium">
              {formatCurrency(breakEven.projectedMonthRevenue)}
            </span>
          </div>
          <FieldHint>
            Esta projeção assume que você continua vendendo no mesmo ritmo dos dias já
            passados no mês ({breakEven.daysElapsedInMonth} de {breakEven.daysInMonth}{' '}
            dias) até o fim do mês. É só uma tendência, não uma garantia.
          </FieldHint>

          <div
            className={`rounded-md border p-3 text-sm ${
              breakEven.isOnTrack
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-amber-300 bg-amber-50 text-amber-800'
            }`}
          >
            {breakEven.isOnTrack
              ? 'Pelo ritmo atual de vendas, você deve atingir a meta de faturamento até o fim do mês.'
              : 'Pelo ritmo atual de vendas, você está abaixo do necessário para atingir a meta até o fim do mês. Vale reforçar as vendas nos próximos dias.'}
          </div>
        </CardContent>
      </Card>

      {breakEven.mix.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Seu mix de vendas nos últimos 30 dias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <FieldHint className="mb-2">
              Mostra quanto cada produto pesou no seu faturamento recente, e qual a
              margem de contribuição de cada um. Produtos com fatia grande e margem
              baixa merecem atenção — talvez valha revisar o preço ou o custo deles.
            </FieldHint>
            {breakEven.mix
              .sort((a, b) => b.revenueShare - a.revenueShare)
              .map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <span className="font-medium">{item.productName}</span>
                  <span className="text-right text-slate-600">
                    {formatNumber(item.revenueShare)}% do faturamento · margem de{' '}
                    {formatNumber(item.contributionMarginPercent)}%
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}