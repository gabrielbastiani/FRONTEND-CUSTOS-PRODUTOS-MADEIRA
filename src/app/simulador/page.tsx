// src/app/simulador/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useProducts, useProduct } from '@/hooks/use-products';
import { Slider } from '@/components/ui/slider';
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
import { Badge } from '@/components/ui/badge';
import {
  simulateProductPricing,
  calculateOverheadPercentFromFixedCost,
  calculateDirectCostOnly,
  type SimMaterialInput,
  type SimLaborInput,
} from '@/lib/pricingSimulator';

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// O @base-ui/react/slider entrega o valor como número puro no onValueChange,
// não como array de um elemento (diferente do padrão Radix clássico).
// Esse helper trata os dois formatos com segurança.
function getSliderScalar(val: number | number[]): number {
  return Array.isArray(val) ? val[0] : val;
}

export default function SimuladorPage() {
  const { data: products } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const { data: product } = useProduct(selectedProductId);

  const [materialsState, setMaterialsState] = useState<
    (SimMaterialInput & { supplierOptions: { id: string; label: string; unitCost: number }[] })[]
  >([]);
  const [laborsState, setLaborsState] = useState<SimLaborInput[]>([]);
  const [marginPercent, setMarginPercent] = useState(0);
  const [overheadMode, setOverheadMode] = useState<'percent' | 'fixedCost'>('percent');
  const [overheadPercent, setOverheadPercent] = useState(0);
  const [fixedCostPerMonth, setFixedCostPerMonth] = useState(0);
  const [unitsProducedPerMonth, setUnitsProducedPerMonth] = useState(1);

  // Carrega os dados reais do produto selecionado como estado inicial editável
  useEffect(() => {
    if (!product) return;

    const initialMaterials = product.materials.map((m) => {
      const supplierOptions = (m.rawMaterial.suppliers ?? []).map((s) => {
        const totalUsageUnits = Number(s.purchaseQty) * Number(m.rawMaterial.conversionFactor);
        const unitCost = totalUsageUnits > 0 ? Number(s.purchasePrice) / totalUsageUnits : 0;
        return {
          id: s.id,
          label: `${s.supplier?.name ?? 'Fornecedor'}${s.isDefault ? ' (padrão)' : ''}`,
          unitCost,
        };
      });

      const defaultOption =
        supplierOptions.find((_, idx) => (m.rawMaterial.suppliers ?? [])[idx]?.isDefault) ??
        supplierOptions[0];

      return {
        rawMaterialId: m.rawMaterial.id,
        name: m.rawMaterial.name,
        unitCost: defaultOption?.unitCost ?? 0,
        quantityUsed: Number(m.quantityUsed),
        wastePercent: Number(m.wastePercent),
        supplierOptions,
      };
    });

    const initialLabors = product.labors.map((l) => ({
      laborRateId: l.laborRate.id,
      name: l.laborRate.name,
      hourlyRate: Number(l.laborRate.hourlyRate),
      hoursSpent: Number(l.hoursSpent),
    }));

    setMaterialsState(initialMaterials);
    setLaborsState(initialLabors);
    setMarginPercent(Number(product.marginPercent));
    setOverheadPercent(Number(product.overheadPercent));
    setOverheadMode('percent');
  }, [product]);

  const directCost = useMemo(
    () => calculateDirectCostOnly(materialsState, laborsState),
    [materialsState, laborsState]
  );

  const effectiveOverheadPercent = useMemo(() => {
    if (overheadMode === 'percent') return overheadPercent;
    return calculateOverheadPercentFromFixedCost(fixedCostPerMonth, unitsProducedPerMonth, directCost);
  }, [overheadMode, overheadPercent, fixedCostPerMonth, unitsProducedPerMonth, directCost]);

  const simulatedResult = useMemo(() => {
    if (materialsState.length === 0 && laborsState.length === 0) return null;
    return simulateProductPricing(materialsState, laborsState, effectiveOverheadPercent, marginPercent);
  }, [materialsState, laborsState, effectiveOverheadPercent, marginPercent]);

  const realResult = useMemo(() => {
    if (!product) return null;
    const realMaterials: SimMaterialInput[] = product.materials.map((m) => {
      const defaultSupplier = (m.rawMaterial.suppliers ?? []).find((s) => s.isDefault);
      const totalUsageUnits = defaultSupplier
        ? Number(defaultSupplier.purchaseQty) * Number(m.rawMaterial.conversionFactor)
        : 0;
      const unitCost =
        defaultSupplier && totalUsageUnits > 0
          ? Number(defaultSupplier.purchasePrice) / totalUsageUnits
          : 0;

      return {
        rawMaterialId: m.rawMaterial.id,
        name: m.rawMaterial.name,
        unitCost,
        quantityUsed: Number(m.quantityUsed),
        wastePercent: Number(m.wastePercent),
      };
    });

    const realLabors: SimLaborInput[] = product.labors.map((l) => ({
      laborRateId: l.laborRate.id,
      name: l.laborRate.name,
      hourlyRate: Number(l.laborRate.hourlyRate),
      hoursSpent: Number(l.hoursSpent),
    }));

    return simulateProductPricing(
      realMaterials,
      realLabors,
      Number(product.overheadPercent),
      Number(product.marginPercent)
    );
  }, [product]);

  function updateMaterial(index: number, patch: Partial<SimMaterialInput>) {
    setMaterialsState((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...patch } : m))
    );
  }

  function updateLabor(index: number, patch: Partial<SimLaborInput>) {
    setLaborsState((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  const priceDiff = simulatedResult && realResult ? simulatedResult.finalPrice - realResult.finalPrice : 0;
  const priceDiffPercent =
    simulatedResult && realResult && realResult.finalPrice > 0
      ? (priceDiff / realResult.finalPrice) * 100
      : 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Simulador de cenários</h1>
        <p className="text-muted-foreground">
          Teste hipóteses de precificação sem alterar o cadastro real do produto. Nada aqui é
          salvo — você só está visualizando "e se" para tomar decisões melhores.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Escolha um produto</CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecione um produto já cadastrado. O simulador vai carregar os dados reais dele
            (materiais, mão de obra, overhead e margem) para que você possa testar mudanças
            sem afetar o cadastro original.
          </p>
        </CardHeader>
        <CardContent>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Selecione um produto para simular">
                {products?.find((p) => p.id === selectedProductId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {products?.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {product && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Matérias-primas</CardTitle>
              <p className="text-sm text-muted-foreground">
                Para cada material usado neste produto, você pode trocar de fornecedor (se
                houver mais de um cadastrado) para ver como o preço unitário impacta o custo
                final, e ajustar o desperdício para simular quanto material se perde no
                processo de corte e montagem. Quanto maior o desperdício, mais matéria-prima
                é consumida por peça, mesmo que a quantidade útil seja a mesma.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {materialsState.map((m, index) => {
                const selectedIndex = m.supplierOptions.findIndex((s) => s.unitCost === m.unitCost);
                const selectedLabel =
                  selectedIndex >= 0 ? m.supplierOptions[selectedIndex].label : undefined;

                return (
                  <div key={m.rawMaterialId} className="space-y-3 border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{m.name}</span>
                      <Badge variant="secondary">{formatBRL(m.unitCost)} / un.</Badge>
                    </div>

                    <div className="grid gap-2">
                      <Label>Fornecedor</Label>
                      <p className="text-xs text-muted-foreground">
                        Troque o fornecedor para simular comprar essa matéria-prima de outra
                        fonte, com outro preço.
                      </p>
                      <Select
                        value={selectedIndex >= 0 ? String(selectedIndex) : undefined}
                        onValueChange={(val) => {
                          const option = m.supplierOptions[Number(val)];
                          if (option) updateMaterial(index, { unitCost: option.unitCost });
                        }}
                      >
                        <SelectTrigger className="w-full max-w-md">
                          <SelectValue placeholder="Selecione um fornecedor">
                            {selectedLabel}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {m.supplierOptions.map((opt, idx) => (
                            <SelectItem key={opt.id} value={String(idx)}>
                              {opt.label} — {formatBRL(opt.unitCost)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Desperdício: {m.wastePercent.toFixed(1)}%</Label>
                      <p className="text-xs text-muted-foreground">
                        Arraste para a direita para simular mais perda de material (sobras de
                        corte, erros de medida etc.). Isso aumenta a quantidade efetiva
                        consumida por peça e, consequentemente, o custo.
                      </p>
                      <Slider
                        value={[m.wastePercent]}
                        min={0}
                        max={50}
                        step={0.5}
                        onValueChange={(val) => updateMaterial(index, { wastePercent: getSliderScalar(val) })}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {laborsState.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Mão de obra</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ajuste quantas horas cada profissional gasta para produzir essa peça. Se o
                  processo ficar mais rápido ou mais lento na prática, mova o slider para ver
                  o impacto direto no preço final.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {laborsState.map((l, index) => (
                  <div key={l.laborRateId} className="space-y-3 border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{l.name}</span>
                      <Badge variant="secondary">{formatBRL(l.hourlyRate)} / hora</Badge>
                    </div>
                    <div className="grid gap-2">
                      <Label>Horas gastas: {l.hoursSpent.toFixed(1)}h</Label>
                      <Slider
                        value={[l.hoursSpent]}
                        min={0}
                        max={Math.max(20, l.hoursSpent * 2)}
                        step={0.5}
                        onValueChange={(val) => updateLabor(index, { hoursSpent: getSliderScalar(val) })}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Custos fixos (overhead)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Overhead são os custos que existem mesmo sem produzir nada (aluguel, energia,
                internet, ferramentas etc.), rateados entre as peças produzidas. Escolha uma
                das duas formas abaixo de simular esse valor.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    overheadMode === 'percent' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                  onClick={() => setOverheadMode('percent')}
                >
                  Percentual direto
                </button>
                <button
                  type="button"
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    overheadMode === 'fixedCost' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                  onClick={() => setOverheadMode('fixedCost')}
                >
                  Rateio de custo fixo mensal
                </button>
              </div>

              {overheadMode === 'percent' ? (
                <div className="grid gap-2">
                  <Label>Overhead: {overheadPercent.toFixed(1)}%</Label>
                  <p className="text-xs text-muted-foreground">
                    Use esse modo se você já sabe, de forma aproximada, quantos % do custo
                    direto (materiais + mão de obra) quer adicionar para cobrir despesas fixas.
                  </p>
                  <Slider
                    value={[overheadPercent]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(val) => setOverheadPercent(getSliderScalar(val))}
                  />
                </div>
              ) : (
                <div className="grid gap-4 max-w-md">
                  <p className="text-xs text-muted-foreground">
                    Use esse modo se você não sabe qual percentual usar, mas sabe quanto gasta
                    fixo por mês e quantas peças costuma produzir. O sistema calcula o
                    percentual de overhead equivalente automaticamente, dividindo o custo fixo
                    pela quantidade de peças e comparando com o custo direto desta peça.
                  </p>
                  <div className="grid gap-2">
                    <Label>Custo fixo mensal (aluguel, energia etc.)</Label>
                    <Input
                      type="number"
                      value={fixedCostPerMonth}
                      onChange={(e) => setFixedCostPerMonth(Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Peças produzidas por mês</Label>
                    <Input
                      type="number"
                      value={unitsProducedPerMonth}
                      onChange={(e) => setUnitsProducedPerMonth(Number(e.target.value))}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Isso equivale a {effectiveOverheadPercent.toFixed(1)}% de overhead sobre o custo
                    direto deste produto.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Margem de lucro</CardTitle>
              <p className="text-sm text-muted-foreground">
                Percentual de lucro que você quer embutir no preço final, aplicado sobre o
                subtotal (custo direto + overhead). Ajuste para ver quanto sobra de lucro em
                cada cenário simulado.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label>Margem: {marginPercent.toFixed(1)}%</Label>
                <Slider
                  value={[marginPercent]}
                  min={0}
                  max={200}
                  step={1}
                  onValueChange={(val) => setMarginPercent(getSliderScalar(val))}
                />
              </div>
            </CardContent>
          </Card>

          {simulatedResult && realResult && (
            <Card>
              <CardHeader>
                <CardTitle>Comparativo</CardTitle>
                <p className="text-sm text-muted-foreground">
                  "Preço real atual" é o preço calculado com os dados exatamente como estão
                  cadastrados no sistema. "Preço simulado" reflete todas as mudanças que você
                  fez nos controles acima. A "Diferença" mostra se o cenário simulado ficou mais
                  barato (verde) ou mais caro (vermelho) que o cadastro real.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Preço real atual</p>
                    <p className="text-2xl font-bold">{formatBRL(realResult.finalPrice)}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Preço simulado</p>
                    <p className="text-2xl font-bold">{formatBRL(simulatedResult.finalPrice)}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Diferença</p>
                    <p
                      className={`text-2xl font-bold ${
                        priceDiff > 0 ? 'text-red-600' : priceDiff < 0 ? 'text-green-600' : ''
                      }`}
                    >
                      {priceDiff > 0 ? '+' : ''}
                      {formatBRL(priceDiff)} ({priceDiffPercent.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}