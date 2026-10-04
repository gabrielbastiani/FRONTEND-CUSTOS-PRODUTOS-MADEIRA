'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FieldHint } from '@/components/ui/field-hint';
import { SectionIntro } from '@/components/ui/section-intro';
import { BreakEvenResult } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/format';

interface Props {
  breakEven: BreakEvenResult;
}

export function BreakEvenCard({ breakEven }: Props) {
  if (!breakEven.isViable) {
    return (
      <Card className="border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="text-base text-red-800">
            Ponto de equilíbrio inatingível
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-red-800">
          <p>
            O preço de venda atual (<strong>{formatCurrency(breakEven.finalPrice)}</strong>)
            não é suficiente nem para cobrir o custo variável de fabricar uma unidade
            deste produto (<strong>{formatCurrency(breakEven.variableCostPerUnit)}</strong>,
            somando material e mão de obra). Ou seja, hoje, quanto mais você vende desse
            produto, mais dinheiro perde — sem contar ainda os custos fixos do negócio
            (aluguel, energia etc.).
          </p>
          <p>
            Para consertar isso, você tem dois caminhos, que podem ser usados juntos:
            aumentar o preço de venda deste produto, ou reduzir o custo de materiais e/ou
            de mão de obra usados para fabricá-lo (por exemplo, revendo desperdício de
            material, buscando um fornecedor mais barato ou reduzindo o tempo de
            produção).
          </p>
        </CardContent>
      </Card>
    );
  }

  const marginIsLow = breakEven.contributionMarginPercent < 20;
  const marginIsModerate =
    breakEven.contributionMarginPercent >= 20 && breakEven.contributionMarginPercent < 40;
  const marginIsHealthy = breakEven.contributionMarginPercent >= 40;

  return (
    <div className="space-y-4">
      <Card className="border-slate-900">
        <CardHeader>
          <CardTitle className="text-base">Ponto de equilíbrio (break-even)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <SectionIntro>
            Este é o cálculo mais importante para saber se um produto realmente vale a
            pena: ele responde à pergunta &quot;quantas unidades deste produto eu preciso
            vender todo mês só para pagar as minhas contas fixas (aluguel, energia,
            internet etc.)?&quot;. Vender menos que esse número significa que, no fim do
            mês, esse produto sozinho não cobriu os custos fixos do negócio. Vender mais
            que esse número é a partir de onde o produto começa a gerar lucro de verdade.
          </SectionIntro>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Preço de venda</span>
              <span className="font-medium">{formatCurrency(breakEven.finalPrice)}</span>
            </div>
            <FieldHint>
              É o valor que você cobra do cliente por uma unidade deste produto, já
              calculado com materiais, mão de obra, custos indiretos e sua margem de
              lucro.
            </FieldHint>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Custo variável por unidade</span>
              <span className="font-medium">
                {formatCurrency(breakEven.variableCostPerUnit)}
              </span>
            </div>
            <FieldHint>
              É quanto você gasta em material e mão de obra para fabricar uma única
              unidade deste produto. Esse custo só existe quando você efetivamente
              produz e vende — se você não fizer nenhuma unidade no mês, não gasta nada
              com isso.
            </FieldHint>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-medium">
              <span>Margem de contribuição por unidade</span>
              <span>
                {formatCurrency(breakEven.contributionMarginPerUnit)} (
                {formatNumber(breakEven.contributionMarginPercent)}%)
              </span>
            </div>
            <FieldHint>
              É quanto sobra do preço de venda depois de descontar o custo variável de
              cada unidade (preço de venda menos custo variável). Esse valor é o que, mês
              a mês, vai sendo usado para pagar os custos fixos do negócio — só depois
              que os custos fixos estiverem totalmente pagos é que esse dinheiro vira
              lucro de fato no seu bolso.
            </FieldHint>
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Custo fixo mensal total do negócio</span>
              <span className="font-medium">
                {formatCurrency(breakEven.totalFixedCostMonthly)}
              </span>
            </div>
            <FieldHint>
              É a soma de tudo que você paga todo mês, independente de vender muito,
              pouco ou nada — aluguel, energia, internet e outros itens cadastrados em
              Configurações da oficina. Diferente do custo variável, esse valor não
              aumenta nem diminui conforme você produz mais ou menos.
            </FieldHint>
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between text-lg font-bold text-emerald-700">
              <span>Unidades a vender por mês</span>
              <span>{breakEven.breakEvenUnitsMonthly}</span>
            </div>
            <FieldHint>
              Este é o número mais importante da tela: é a quantidade mínima deste
              produto que você precisa vender por mês para que o dinheiro que sobra de
              cada venda (a margem de contribuição) cubra totalmente os custos fixos do
              negócio. Vendendo essa quantidade, você não tem lucro nem prejuízo com este
              produto — é o ponto de equilíbrio. A partir da próxima unidade vendida,
              começa o lucro real.
            </FieldHint>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Receita equivalente ao ponto de equilíbrio</span>
              <span>{formatCurrency(breakEven.breakEvenRevenueMonthly)}</span>
            </div>
            <FieldHint>
              É quanto dinheiro de faturamento (não de lucro) essa quantidade de vendas
              representa. Serve como referência de meta de vendas em reais, e não só em
              unidades.
            </FieldHint>
          </div>
        </CardContent>
      </Card>

      <Card
        className={
          marginIsHealthy
            ? 'border-emerald-300 bg-emerald-50'
            : marginIsModerate
              ? 'border-amber-300 bg-amber-50'
              : 'border-red-300 bg-red-50'
        }
      >
        <CardHeader>
          <CardTitle
            className={
              'text-base ' +
              (marginIsHealthy
                ? 'text-emerald-800'
                : marginIsModerate
                  ? 'text-amber-800'
                  : 'text-red-800')
            }
          >
            {marginIsHealthy && 'Boa margem de contribuição'}
            {marginIsModerate && 'Margem de contribuição razoável'}
            {marginIsLow && 'Margem de contribuição apertada'}
          </CardTitle>
        </CardHeader>
        <CardContent
          className={
            'space-y-2 text-sm ' +
            (marginIsHealthy
              ? 'text-emerald-800'
              : marginIsModerate
                ? 'text-amber-800'
                : 'text-red-800')
          }
        >
          {marginIsHealthy && (
            <p>
              Sua margem de contribuição está em {formatNumber(breakEven.contributionMarginPercent)}%,
              o que é considerado saudável para negócios artesanais de pequeno porte.
              Isso significa que uma fatia grande de cada venda sobra para pagar os
              custos fixos rapidamente, exigindo um volume de vendas menor para atingir
              o ponto de equilíbrio.
            </p>
          )}
          {marginIsModerate && (
            <p>
              Sua margem de contribuição está em {formatNumber(breakEven.contributionMarginPercent)}%.
              Não é uma margem ruim, mas negócios artesanais costumam se sair melhor com
              margens de contribuição acima de 40%, já que os custos fixos ficam mais
              fáceis de cobrir com um volume de vendas menor. Vale avaliar se dá para
              aumentar um pouco o preço de venda ou reduzir o desperdício de material e
              o tempo de produção deste produto.
            </p>
          )}
          {marginIsLow && (
            <p>
              Sua margem de contribuição está em apenas {formatNumber(breakEven.contributionMarginPercent)}%,
              o que significa que a maior parte do preço de venda já está comprometida
              com material e mão de obra. Nesse cenário, você depende de vender um volume
              alto de unidades só para cobrir os custos fixos, e qualquer imprevisto (um
              mês de vendas mais fraco, por exemplo) pode gerar prejuízo. Considere
              aumentar o preço de venda deste produto, reduzir o desperdício de material
              cadastrado nele, negociar um fornecedor mais barato, ou revisar o tempo de
              mão de obra necessário para fabricá-lo.
            </p>
          )}
          <p className="text-xs opacity-80">
            Regra prática: quanto maior a margem de contribuição percentual, menos
            unidades você precisa vender todo mês para cobrir os custos fixos — e mais
            protegido fica o negócio em meses de venda mais fraca.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}