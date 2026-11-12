'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldHint } from '@/components/ui/field-hint';
import { Trash2, Plus } from 'lucide-react';
import {
  useFixedCosts,
  useCreateFixedCost,
  useDeleteFixedCost,
} from '@/hooks/use-fixed-costs';
import { formatCurrency } from '@/lib/format';

export default function WorkshopSettingsPage() {
  const { data: fixedCosts, isLoading: loadingFixedCosts } = useFixedCosts();
  const createFixedCostMutation = useCreateFixedCost();
  const deleteFixedCostMutation = useDeleteFixedCost();

  const [fixedCostName, setFixedCostName] = useState('');
  const [fixedCostValue, setFixedCostValue] = useState('');


  const handleAddFixedCost = () => {
    if (!fixedCostName.trim() || !fixedCostValue) return;
    createFixedCostMutation.mutate({
      name: fixedCostName.trim(),
      monthlyValue: Number(fixedCostValue),
    });
    setFixedCostName('');
    setFixedCostValue('');
  };

  const totalFixedCost = (fixedCosts ?? []).reduce((sum, item) => {
    if (!item.isActive) return sum;
    return sum + Number(item.monthlyValue);
  }, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configurações da oficina</h2>
        <p className="text-sm text-slate-500">
          Cadastre e acompanhe as despesas recorrentes da oficina. Esses valores são usados nos indicadores financeiros do negócio; os custos indiretos de cada produto são informados diretamente na sua composição.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custos fixos mensais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FieldHint>
            Adicione despesas recorrentes da oficina, como aluguel, energia, internet,
            telefone, manutenção ou ferramentas. A soma dos itens ativos é utilizada
            nos cálculos de ponto de equilíbrio e metas financeiras. Para não depender
            de uma estimativa de produção mensal, esses custos não são distribuídos
            automaticamente entre os produtos.
          </FieldHint>

          <div className="grid grid-cols-12 gap-2 items-end rounded-md border bg-slate-50 p-3">
            <div className="col-span-7 space-y-1">
              <Label className="text-xs">Descrição</Label>
              <Input
                value={fixedCostName}
                onChange={(e) => setFixedCostName(e.target.value)}
                placeholder="Ex: Aluguel do galpão"
              />
            </div>
            <div className="col-span-3 space-y-1">
              <Label className="text-xs">Valor mensal (R$)</Label>
              <Input
                type="number"
                step="any"
                value={fixedCostValue}
                onChange={(e) => setFixedCostValue(e.target.value)}
                placeholder="Ex: 1500"
              />
            </div>
            <div className="col-span-2">
              <Button
                type="button"
                onClick={handleAddFixedCost}
                disabled={
                  !fixedCostName.trim() ||
                  !fixedCostValue ||
                  createFixedCostMutation.isPending
                }
                className="w-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!loadingFixedCosts && (fixedCosts ?? []).length === 0 && (
            <p className="text-sm text-slate-500">
              Nenhum custo fixo cadastrado ainda.
            </p>
          )}

          {(fixedCosts ?? []).length > 0 && (
            <div className="space-y-2">
              {fixedCosts!.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                >
                  <span>
                    <span className="font-medium">{item.name}</span> —{' '}
                    {formatCurrency(Number(item.monthlyValue))}
                    {!item.isActive && (
                      <span className="ml-2 text-xs text-slate-400">(inativo)</span>
                    )}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteFixedCostMutation.mutate(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
              <p className="text-right text-sm font-medium text-slate-700">
                Total de custos fixos ativos: {formatCurrency(totalFixedCost)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}