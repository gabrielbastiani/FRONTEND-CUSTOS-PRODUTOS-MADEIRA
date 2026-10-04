'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FieldHint } from '@/components/ui/field-hint';
import { SectionIntro } from '@/components/ui/section-intro';
import { useCalculateProfitGoal } from '@/hooks/use-profit-goal';
import { formatCurrency, formatNumber } from '@/lib/format';

export default function ProfitGoalPage() {
  const [desiredProfit, setDesiredProfit] = useState('');
  const calculateMutation = useCalculateProfitGoal();

  const handleCalculate = () => {
    const value = Number(desiredProfit);
    if (!value || value <= 0) return;
    calculateMutation.mutate(value);
  };

  const result = calculateMutation.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Quanto preciso vender</h2>
        <p className="text-sm text-slate-500">
          Informe quanto de lucro você quer tirar este mês, e o sistema calcula quantas
          unidades de cada produto seriam necessárias para chegar lá.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sua meta de lucro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SectionIntro>
            Diferente de definir um preço a partir do custo, aqui você faz o caminho
            inverso: diz quanto quer ganhar de lucro líquido (depois de pagar material,
            mão de obra e custos fixos do negócio), e o sistema calcula quantas vendas
            isso exige.
          </SectionIntro>

          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="desiredProfit">Quanto quero de lucro este mês (R$)</Label>
              <Input
                id="desiredProfit"
                type="number"
                step="any"
                value={desiredProfit}
                onChange={(e) => setDesiredProfit(e.target.value)}
                placeholder="Ex: 3000"
              />
              <FieldHint>
                Este é o valor líquido que você quer ver sobrando no seu bolso, depois
                de já ter pago material, mão de obra e as contas fixas do negócio
                (aluguel, energia etc.).
              </FieldHint>
            </div>
            <Button
              onClick={handleCalculate}
              disabled={calculateMutation.isPending || !desiredProfit}
            >
              {calculateMutation.isPending ? 'Calculando...' : 'Calcular'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className="border-slate-900">
            <CardHeader>
              <CardTitle className="text-base">
                Vendendo no seu mix de produtos atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <FieldHint>
                Esta conta assume que você continua vendendo os produtos na mesma
                proporção que já vem vendendo nos últimos 30 dias, sem focar em um só.
              </FieldHint>

              {result.byMix.isEstimated && (
                <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-800">
                  Ainda não há produção suficiente registrada para saber seu mix real de
                  vendas, então este valor usa a margem média de todos os produtos
                  cadastrados como estimativa.
                </p>
              )}

              {!result.byMix.isViable ? (
                <p className="rounded-md border border-red-300 bg-red-50 p-3 text-red-800">
                  Não foi possível calcular esta meta com o mix atual, pois a margem de
                  contribuição média está zerada ou negativa. Revise o preço e o custo
                  dos seus produtos.
                </p>
              ) : (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      Margem de contribuição média do seu mix
                    </span>
                    <span className="font-medium">
                      {formatNumber(result.byMix.weightedContributionMarginPercent)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-emerald-700">
                    <span>Faturamento total necessário no mês</span>
                    <span>{formatCurrency(result.byMix.revenueNeeded)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Se você focasse em vender só um produto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <FieldHint className="mb-2">
                Para cada produto, mostra quantas unidades você precisaria vender dele,
                sozinho, para bater a mesma meta de lucro. Produtos no topo da lista
                exigem menos unidades vendidas, geralmente por terem uma margem de
                contribuição melhor.
              </FieldHint>
              {result.byProduct.length === 0 && (
                <p className="text-slate-500">
                  Nenhum produto viável encontrado para esta meta. Cadastre produtos com
                  preço de venda acima do custo variável.
                </p>
              )}
              {result.byProduct.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-slate-500">
                      Preço de venda: {formatCurrency(item.finalPrice)} · margem de
                      contribuição: {formatCurrency(item.contributionMarginPerUnit)} por
                      unidade
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-700">
                      {item.unitsNeeded} un.
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatCurrency(item.revenueNeeded)} em faturamento
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}