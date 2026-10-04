'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { CircleHelp } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PricingResult } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/format';

interface Props {
  pricing: PricingResult;
}

const CHART_COLORS = [
  '#3b82f6', // Materiais
  '#8b5cf6', // Mão de obra
  '#f59e0b', // Custos indiretos
  '#10b981', // Margem
];

function TermHelp({
  term,
  explanation,
}: {
  term: string;
  explanation: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 8, left: 8 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !mounted) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const tooltip = tooltipRef.current;

      if (!trigger || !tooltip) return;

      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const margin = 8;
      const gap = 8;

      const fitsBelow =
        triggerRect.bottom + gap + tooltipRect.height <=
        window.innerHeight - margin;

      const top = fitsBelow
        ? triggerRect.bottom + gap
        : Math.max(margin, triggerRect.top - tooltipRect.height - gap);

      const maxLeft = Math.max(
        margin,
        window.innerWidth - tooltipRect.width - margin
      );

      const left = Math.min(Math.max(triggerRect.left, margin), maxLeft);

      setPosition({ top, left });
    };

    // Aguarda o balão entrar no DOM para medir suas dimensões corretamente.
    const animationFrame = window.requestAnimationFrame(updatePosition);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, mounted, explanation]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;

      if (
        !triggerRef.current?.contains(target) &&
        !tooltipRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Explicação: ${term}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="ml-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
      >
        <CircleHelp className="h-4 w-4" aria-hidden="true" />
      </button>

      {mounted &&
        open &&
        createPortal(
          <span
            ref={tooltipRef}
            role="tooltip"
            className="fixed z-[9999] w-64 max-w-[calc(100vw-2rem)] rounded-md border bg-white p-3 text-left text-xs font-normal leading-relaxed text-slate-700 shadow-lg"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            {explanation}
          </span>,
          document.body
        )}
    </>
  );
}

export function CostBreakdown({ pricing }: Props) {
  const { overhead } = pricing.breakdown;

  const chartData = [
    { name: 'Materiais', value: Math.max(0, pricing.materialsCost) },
    { name: 'Mão de obra', value: Math.max(0, pricing.laborCost) },
    { name: 'Custos indiretos', value: Math.max(0, pricing.overheadCost) },
    { name: 'Margem adicionada', value: Math.max(0, pricing.marginValue) },
  ];

  const hasChartData = chartData.some((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            Composição do preço sugerido
            <TermHelp
              term="Composição do preço"
              explanation="Mostra como o preço sugerido se divide entre materiais, mão de obra, custos indiretos e margem adicionada."
            />
          </CardTitle>
          <p className="text-sm text-slate-600">
            Veja quanto cada parte representa no preço final do produto.
          </p>
        </CardHeader>

        <CardContent>
          {hasChartData ? (
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
              <div
                className="h-[260px] min-w-0"
                role="img"
                aria-label="Gráfico da composição do preço sugerido por materiais, mão de obra, custos indiretos e margem"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.filter((item) => item.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {chartData
                        .filter((item) => item.value > 0)
                        .map((item) => {
                          const originalIndex = chartData.findIndex(
                            (chartItem) => chartItem.name === item.name
                          );

                          return (
                            <Cell
                              key={item.name}
                              fill={CHART_COLORS[originalIndex]}
                            />
                          );
                        })}
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
                {chartData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-sm"
                        style={{ backgroundColor: CHART_COLORS[index] }}
                        aria-hidden="true"
                      />
                      <span className="flex items-center text-slate-600">
                        {item.name}

                        {item.name === 'Materiais' && (
                          <TermHelp
                            term="Materiais"
                            explanation="Valor dos materiais usados na fabricação do produto, considerando as quantidades informadas."
                          />
                        )}

                        {item.name === 'Mão de obra' && (
                          <TermHelp
                            term="Mão de obra"
                            explanation="Custo do tempo de trabalho necessário para fabricar o produto, calculado com base nas horas e nos valores por hora cadastrados."
                          />
                        )}

                        {item.name === 'Custos indiretos' && (
                          <TermHelp
                            term="Custos indiretos"
                            explanation="Despesas da oficina que não correspondem a um material ou a uma hora de trabalho específica, como energia ou manutenção. O sistema atribui uma parte delas ao produto."
                          />
                        )}

                        {item.name === 'Margem adicionada' && (
                          <TermHelp
                            term="Margem adicionada"
                            explanation="Valor acrescentado ao subtotal dos custos para formar o preço sugerido. Não é o mesmo que margem de contribuição."
                          />
                        )}
                      </span>
                    </div>

                    <span className="shrink-0 font-medium">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between gap-3 font-semibold">
                  <span>Preço final</span>
                  <span>{formatCurrency(pricing.finalPrice)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              Ainda não há valores para mostrar no gráfico. Confira os
              materiais, a mão de obra e os custos indiretos deste produto.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            Materiais
            <TermHelp
              term="Materiais"
              explanation="Lista os materiais usados no produto e mostra como a quantidade, o desperdício e o custo unitário influenciam o custo total."
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Custo unitário</TableHead>
                <TableHead>Qtd. usada</TableHead>
                <TableHead>Desperdício</TableHead>
                <TableHead>
                  Qtd. efetiva
                  <TermHelp
                    term="Quantidade efetiva"
                    explanation="Quantidade de material considerada no cálculo do custo, após incluir o desperdício informado."
                  />
                </TableHead>
                <TableHead className="text-right">Custo total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricing.breakdown.materials.map((item) => (
                <TableRow key={item.rawMaterialId}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{formatCurrency(item.unitCost)}</TableCell>
                  <TableCell>{formatNumber(item.quantityUsed)}</TableCell>
                  <TableCell>{item.wastePercent}%</TableCell>
                  <TableCell>{formatNumber(item.effectiveQuantity)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.totalCost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            Mão de obra
            <TermHelp
              term="Mão de obra"
              explanation="Custo do trabalho necessário para fabricar o produto. É calculado com o valor por hora e o tempo informado para cada função."
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Função</TableHead>
                <TableHead>Valor/hora</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead className="text-right">Custo total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricing.breakdown.labors.map((item) => (
                <TableRow key={item.laborRateId}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{formatCurrency(item.hourlyRate)}</TableCell>
                  <TableCell>{formatNumber(item.hoursSpent)}h</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.totalCost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            Custos indiretos
            <TermHelp
              term="Custos indiretos"
              explanation="Despesas da oficina que não pertencem a um único produto, como energia, aluguel ou manutenção. O rateio atribui uma parte dessas despesas a cada produto."
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {overhead.mode === 'MANUAL' ? (
            <div className="flex justify-between gap-4">
              <span className="flex items-center text-slate-600">
                Rateio manual
                <TermHelp
                  term="Rateio"
                  explanation="Divisão de uma despesa entre os produtos. Neste modo, o custo indireto é calculado usando o percentual manual configurado."
                />
                {' '}(itens fixos, {formatNumber(overhead.overheadPercent)}% sobre
                custo direto)
                <TermHelp
                  term="Custo direto"
                  explanation="Custo ligado diretamente à fabricação do produto. Nesta tela, inclui materiais e mão de obra."
                />
              </span>
              <span className="shrink-0">
                {formatCurrency(pricing.overheadCost)}
              </span>
            </div>
          ) : !overhead.isConfigured ? (
            <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              O rateio automático está ativado, mas a capacidade produtiva
              mensal da oficina ainda não foi configurada (ou está zerada). Por
              isso, o custo indireto está sendo considerado como R$ 0,00. Acesse
              Configurações da oficina para definir a capacidade produtiva
              mensal.
            </p>
          ) : (
            <>
              <div className="flex justify-between gap-4">
                <span className="flex items-center text-slate-600">
                  Capacidade produtiva mensal
                  <TermHelp
                    term="Capacidade produtiva mensal"
                    explanation="Estimativa das horas disponíveis para produção na oficina durante um mês. O sistema usa esse dado no cálculo automático dos custos indiretos."
                  />
                </span>
                <span>
                  {formatNumber(overhead.monthlyProductiveHours)}h
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="flex items-center text-slate-600">
                  Unidades produzíveis por mês
                  <TermHelp
                    term="Unidades produzíveis"
                    explanation="Estimativa de quantas unidades deste produto podem ser fabricadas por mês, considerando a capacidade produtiva e o tempo de mão de obra cadastrado."
                  />
                </span>
                <span>{formatNumber(overhead.unitsProducibleMonthly)}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="flex items-center text-slate-600">
                  Custo fixo mensal total
                  <TermHelp
                    term="Custo fixo mensal"
                    explanation="Total das despesas fixas mensais da oficina consideradas no cálculo, como aluguel ou outras despesas recorrentes cadastradas."
                  />
                </span>
                <span>
                  {formatCurrency(overhead.totalFixedCostMonthly)}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between gap-4 font-medium">
                <span className="flex items-center">
                  Custo indireto rateado (automático)
                  <TermHelp
                    term="Custo indireto rateado"
                    explanation="Parte dos custos fixos mensais atribuída a este produto pelo cálculo automático."
                  />
                </span>
                <span>{formatCurrency(pricing.overheadCost)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            Resumo final
            <TermHelp
              term="Resumo final"
              explanation="Reúne os custos calculados, o valor acrescentado como margem e o preço final sugerido para o produto."
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Custo de materiais</span>
            <span>{formatCurrency(pricing.materialsCost)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-600">Custo de mão de obra</span>
            <span>{formatCurrency(pricing.laborCost)}</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center text-slate-600">
              Custos indiretos
              <TermHelp
                term="Custos indiretos"
                explanation="Despesas da oficina atribuídas ao produto, como uma parte da energia, do aluguel ou da manutenção."
              />
            </span>
            <span>{formatCurrency(pricing.overheadCost)}</span>
          </div>

          <Separator />

          <div className="flex justify-between font-medium">
            <span className="flex items-center">
              Subtotal
              <TermHelp
                term="Subtotal"
                explanation="Soma dos materiais, da mão de obra e dos custos indiretos antes de acrescentar a margem."
              />
            </span>
            <span>{formatCurrency(pricing.subtotalCost)}</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center text-slate-600">
              Margem de lucro ({pricing.breakdown.marginPercent}%)
              <TermHelp
                term="Margem de lucro"
                explanation="Percentual aplicado sobre o subtotal dos custos para calcular o valor acrescentado ao preço sugerido. Não é o mesmo que margem de contribuição."
              />
            </span>
            <span>{formatCurrency(pricing.marginValue)}</span>
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-bold text-emerald-700">
            <span>Preço final sugerido</span>
            <span>{formatCurrency(pricing.finalPrice)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}