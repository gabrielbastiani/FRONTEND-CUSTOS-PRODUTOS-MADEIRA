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
    overheadCostPerUnit: number;
    marginPercent: number;
  };
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Versão de simulação do cálculo de preço, adaptada para valores já resolvidos
 * no cliente. O custo indireto recebido já é um valor em reais por unidade.
 */
export function simulateProductPricing(
  materials: SimMaterialInput[],
  labors: SimLaborInput[],
  overheadCostPerUnit: number,
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
  const overheadCost = round2(Math.max(0, overheadCostPerUnit));
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
      overheadCostPerUnit: overheadCost,
      marginPercent,
    },
  };
}

/**
 * Calcula uma parcela adicional em reais por unidade a partir de um custo
 * fixo mensal informado para uma simulação e da quantidade mensal estimada.
 * Não altera o custo indireto já cadastrado no produto.
 */
export function calculateAdditionalOverheadPerUnit(
  fixedCostPerMonth: number,
  unitsProducedPerMonth: number
): number {
  if (fixedCostPerMonth <= 0 || unitsProducedPerMonth <= 0) return 0;
  return round2(fixedCostPerMonth / unitsProducedPerMonth);
}

export function calculateDirectCostOnly(
  materials: SimMaterialInput[],
  labors: SimLaborInput[]
): number {
  const result = simulateProductPricing(materials, labors, 0, 0);
  return result.materialsCost + result.laborCost;
}