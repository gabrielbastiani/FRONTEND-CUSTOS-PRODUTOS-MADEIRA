export interface SimMaterialInput {
  rawMaterialId: string;
  name: string;
  unitCost: number; // já resolvido a partir do fornecedor escolhido
  quantityUsed: number;
  wastePercent: number;
}

export interface SimLaborInput {
  laborRateId: string;
  name: string;
  hourlyRate: number;
  hoursSpent: number;
}

export interface SimMaterialBreakdown extends SimMaterialInput {
  effectiveQuantity: number;
  totalCost: number;
}

export interface SimLaborBreakdown extends SimLaborInput {
  totalCost: number;
}

export interface SimPricingResult {
  materialsCost: number;
  laborCost: number;
  overheadCost: number;
  subtotalCost: number;
  marginValue: number;
  finalPrice: number;
  breakdown: {
    materials: SimMaterialBreakdown[];
    labors: SimLaborBreakdown[];
    overheadPercent: number;
    marginPercent: number;
  };
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Réplica fiel de calculateProductPricing do backend (pricingCalculator.ts),
 * adaptada para trabalhar com valores já resolvidos no cliente (sem Prisma.Decimal
 * e sem precisar buscar o fornecedor padrão, já que o unitCost é escolhido
 * interativamente pelo usuário no simulador).
 */
export function simulateProductPricing(
  materials: SimMaterialInput[],
  labors: SimLaborInput[],
  overheadPercent: number,
  marginPercent: number
): SimPricingResult {
  const materialBreakdown: SimMaterialBreakdown[] = materials.map((item) => {
    const effectiveQuantity = item.quantityUsed * (1 + item.wastePercent / 100);
    const totalCost = item.unitCost * effectiveQuantity;

    return {
      ...item,
      effectiveQuantity: round2(effectiveQuantity),
      totalCost: round2(totalCost),
    };
  });

  const laborBreakdown: SimLaborBreakdown[] = labors.map((item) => {
    const totalCost = item.hourlyRate * item.hoursSpent;

    return {
      ...item,
      totalCost: round2(totalCost),
    };
  });

  const materialsCost = round2(materialBreakdown.reduce((sum, m) => sum + m.totalCost, 0));
  const laborCost = round2(laborBreakdown.reduce((sum, l) => sum + l.totalCost, 0));

  const directCost = materialsCost + laborCost;
  const overheadCost = round2(directCost * (overheadPercent / 100));
  const subtotalCost = round2(directCost + overheadCost);
  const marginValue = round2(subtotalCost * (marginPercent / 100));
  const finalPrice = round2(subtotalCost + marginValue);

  return {
    materialsCost,
    laborCost,
    overheadCost,
    subtotalCost,
    marginValue,
    finalPrice,
    breakdown: {
      materials: materialBreakdown,
      labors: laborBreakdown,
      overheadPercent,
      marginPercent,
    },
  };
}

/**
 * Calcula o overheadPercent equivalente a partir de um rateio de custo fixo
 * mensal dividido pela quantidade de peças produzidas no mês, relativizado
 * ao custo direto (materiais + mão de obra) do produto simulado.
 * Ex: aluguel de R$900/mês, produzindo 30 peças => R$30/peça de rateio.
 * Se o custo direto da peça é R$60, isso equivale a 50% de overhead.
 */
export function calculateOverheadPercentFromFixedCost(
  fixedCostPerMonth: number,
  unitsProducedPerMonth: number,
  directCost: number
): number {
  if (unitsProducedPerMonth <= 0 || directCost <= 0) return 0;

  const fixedCostPerUnit = fixedCostPerMonth / unitsProducedPerMonth;
  return round2((fixedCostPerUnit / directCost) * 100);
}

export function calculateDirectCostOnly(
  materials: SimMaterialInput[],
  labors: SimLaborInput[]
): number {
  const result = simulateProductPricing(materials, labors, 0, 0);
  return result.materialsCost + result.laborCost;
}