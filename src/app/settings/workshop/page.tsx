'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldHint } from '@/components/ui/field-hint';
import { SectionIntro } from '@/components/ui/section-intro';
import { Trash2, Plus } from 'lucide-react';
import {
  useWorkshopSettings,
  useUpdateWorkshopSettings,
} from '@/hooks/use-workshop-settings';
import {
  useFixedCosts,
  useCreateFixedCost,
  useDeleteFixedCost,
} from '@/hooks/use-fixed-costs';
import { formatCurrency } from '@/lib/format';

const settingsSchema = z.object({
  monthlyProductiveHours: z.coerce.number().min(0, 'Não pode ser negativo'),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function WorkshopSettingsPage() {
  const { data: settings, isLoading: loadingSettings } = useWorkshopSettings();
  const updateSettingsMutation = useUpdateWorkshopSettings();

  const { data: fixedCosts, isLoading: loadingFixedCosts } = useFixedCosts();
  const createFixedCostMutation = useCreateFixedCost();
  const deleteFixedCostMutation = useDeleteFixedCost();

  const [fixedCostName, setFixedCostName] = useState('');
  const [fixedCostValue, setFixedCostValue] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: settings
      ? { monthlyProductiveHours: Number(settings.monthlyProductiveHours) }
      : undefined,
  });

  const onSubmitSettings = (values: SettingsFormValues) => {
    updateSettingsMutation.mutate(values);
  };

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
          Defina a capacidade produtiva mensal e os custos fixos usados no rateio
          automático de custos indiretos dos produtos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Capacidade produtiva mensal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SectionIntro>
            Informe quantas horas de mão de obra estão disponíveis por mês. Esse valor é
            cruzado com o tempo estimado de produção de cada produto para calcular
            quantas unidades podem ser produzidas por mês, e assim ratear os custos
            fixos automaticamente.
          </SectionIntro>

          <form
            onSubmit={handleSubmit(onSubmitSettings)}
            className="flex items-end gap-3"
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="monthlyProductiveHours">
                Horas produtivas disponíveis por mês
              </Label>
              <Input
                id="monthlyProductiveHours"
                type="number"
                step="any"
                {...register('monthlyProductiveHours')}
              />
              {errors.monthlyProductiveHours && (
                <p className="text-sm text-red-600">
                  {errors.monthlyProductiveHours.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={loadingSettings || updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custos fixos mensais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FieldHint>
            Adicione os custos fixos da oficina, como aluguel, energia, internet ou
            outras despesas recorrentes. A soma dos itens ativos é dividida pela
            quantidade de unidades produzíveis no mês para chegar no custo indireto por
            unidade de cada produto.
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