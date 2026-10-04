'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { FieldHint } from '@/components/ui/field-hint';
import { OverheadCostPicker, OverheadItem } from './overhead-cost-picker';
import { useWorkshopSettings } from '@/hooks/use-workshop-settings';
import { useFixedCosts } from '@/hooks/use-fixed-costs';
import { formatCurrency, formatNumber } from '@/lib/format';
import { OverheadMode } from '@/types';

interface Props {
  mode: OverheadMode;
  onModeChange: (mode: OverheadMode) => void;
  overheadItems: OverheadItem[];
  onOverheadItemsChange: (items: OverheadItem[]) => void;
  productionTimeHours: number;
}

export function OverheadModeSelector({
  mode,
  onModeChange,
  overheadItems,
  onOverheadItemsChange,
  productionTimeHours,
}: Props) {
  const { data: settings } = useWorkshopSettings();
  const { data: fixedCosts } = useFixedCosts();

  const monthlyProductiveHours = Number(settings?.monthlyProductiveHours ?? 0);
  const totalFixedCostMonthly = (fixedCosts ?? [])
    .filter((item) => item.isActive)
    .reduce((sum, item) => sum + Number(item.monthlyValue), 0);

  const canUseAutomatic = monthlyProductiveHours > 0 && productionTimeHours > 0;

  const unitsProducibleMonthly = canUseAutomatic
    ? monthlyProductiveHours / productionTimeHours
    : 0;
  const overheadCostPerUnit =
    canUseAutomatic && unitsProducibleMonthly > 0
      ? totalFixedCostMonthly / unitsProducibleMonthly
      : 0;

  return (
    <div className="space-y-4">
      <RadioGroup
        value={mode}
        onValueChange={(value) => onModeChange(value as OverheadMode)}
        className="flex gap-6"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="MANUAL" id="overhead-manual" />
          <Label htmlFor="overhead-manual" className="cursor-pointer font-normal">
            Itens manuais
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="AUTOMATIC" id="overhead-automatic" />
          <Label htmlFor="overhead-automatic" className="cursor-pointer font-normal">
            Rateio automático por capacidade produtiva
          </Label>
        </div>
      </RadioGroup>

      {mode === 'MANUAL' && (
        <>
          <FieldHint>
            Adicione custos que não são de material nem de mão de obra direta, como
            energia elétrica, depreciação de ferramentas, embalagem ou transporte. Cada
            item é somado ao custo final do produto, proporcionalmente ao custo direto
            (materiais + mão de obra) já calculado.
          </FieldHint>
          <OverheadCostPicker items={overheadItems} onChange={onOverheadItemsChange} />
        </>
      )}

      {mode === 'AUTOMATIC' && (
        <>
          <FieldHint>
            O custo indireto é calculado automaticamente a partir da capacidade
            produtiva mensal da oficina e dos custos fixos mensais (aluguel, energia
            etc.), configurados em Configurações da oficina. Não é necessário adicionar
            itens manualmente aqui.
          </FieldHint>

          {!canUseAutomatic && (
            <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              Para o rateio automático funcionar de fato, é necessário que a oficina
              tenha uma capacidade produtiva mensal configurada (maior que zero) e que
              o produto tenha ao menos uma hora de mão de obra cadastrada. Enquanto
              isso, o custo indireto deste produto será considerado R$ 0,00. Acesse
              Configurações da oficina para definir a capacidade produtiva.
            </p>
          )}

          {canUseAutomatic && (
            <Card className="border-slate-200 bg-slate-50">
              <CardContent className="space-y-2 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Capacidade produtiva mensal</span>
                  <span>{formatNumber(monthlyProductiveHours)}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Tempo de produção deste produto
                  </span>
                  <span>{formatNumber(productionTimeHours)}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Unidades produzíveis por mês</span>
                  <span>{formatNumber(unitsProducibleMonthly)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Custo fixo mensal total</span>
                  <span>{formatCurrency(totalFixedCostMonthly)}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-800">
                  <span>Custo indireto rateado por unidade</span>
                  <span>{formatCurrency(overheadCostPerUnit)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}