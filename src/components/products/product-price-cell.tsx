'use client';

import { useProductCost } from '@/hooks/use-products';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/format';

interface Props {
  productId: string;
}

export function ProductPriceCell({ productId }: Props) {
  const { data: pricing, isLoading, isError } = useProductCost(productId);

  if (isLoading) {
    return (
      <div className="space-y-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    );
  }

  if (isError || !pricing) {
    return <span className="text-slate-400">—</span>;
  }

  const finalPrice = Number(pricing.finalPrice ?? 0);
  const materialsCost = Number(pricing.materialsCost ?? 0);
  const laborCost = Number(pricing.laborCost ?? 0);
  const variableCost = materialsCost + laborCost;

  const contributionMarginPercent =
    finalPrice > 0
      ? ((finalPrice - variableCost) / finalPrice) * 100
      : 0;

  const isViable = finalPrice > variableCost;

  const marginHealth = !isViable
    ? {
        label: 'Inviável',
        className: 'text-red-700',
      }
    : contributionMarginPercent < 20
      ? {
          label: 'Apertada',
          className: 'text-red-700',
        }
      : contributionMarginPercent < 40
        ? {
            label: 'Razoável',
            className: 'text-amber-700',
          }
        : {
            label: 'Boa',
            className: 'text-emerald-700',
          };

  return (
    <div className="space-y-1">
      <span className={`font-semibold ${marginHealth.className}`}>
        {formatCurrency(finalPrice)}
      </span>
      <span
        className={`block text-xs ${marginHealth.className}`}
        title="Margem de contribuição calculada após materiais e mão de obra"
      >
        {marginHealth.label}
        {isViable &&
          ` · ${contributionMarginPercent
            .toFixed(1)
            .replace('.', ',')}%`}
      </span>
    </div>
  );
}