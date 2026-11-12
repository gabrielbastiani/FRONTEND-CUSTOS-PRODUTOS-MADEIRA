import type { PricingResult } from '@/types';

/**
 * Custo variável unitário usado pela margem de contribuição.
 * Custos indiretos novos são variáveis por unidade. O rateio fixo legado é
 * mantido no preço, mas não é descontado aqui porque os mesmos custos já
 * permanecem no total mensal de custos fixos do ponto de equilíbrio.
 */
export function calculateContributionVariableCost(
  pricing: PricingResult | null | undefined
): number {
  if (!pricing) return 0;

  const fixedAllocation = (pricing.breakdown?.overhead?.overheadItems ?? [])
    .filter((item) => item.isFixedCostAllocation)
    .reduce((sum, item) => sum + Number(item.value || 0), 0);

  return Math.round((
    Number(pricing.materialsCost || 0) +
    Number(pricing.laborCost || 0) +
    Math.max(0, Number(pricing.overheadCost || 0) - fixedAllocation)
  + Number.EPSILON) * 100) / 100;
}
