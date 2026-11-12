'use client';

import { useProductCost } from '@/hooks/use-products';
import { calculateContributionVariableCost } from '@/lib/contribution-cost';
import { Skeleton } from '@/components/ui/skeleton';
import { TableCell } from '@/components/ui/table';
import { formatCurrency } from '@/lib/format';

interface Props {
  productId: string;
}

/**
 * Renderiza as duas colunas da listagem usando a mesma consulta de precificação:
 * - Custo total: materiais + mão de obra + custos indiretos (subtotalCost).
 * - Preço final: custo total + margem aplicada (finalPrice).
 */
export function ProductPricingCells({ productId }: Props) {
  const { data: pricing, isLoading, isError } = useProductCost(productId);

  if (isLoading) {
    return (
      <>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </TableCell>
      </>
    );
  }

  if (isError || !pricing) {
    return (
      <>
        <TableCell>
          <span className="text-slate-400">—</span>
        </TableCell>
        <TableCell>
          <span className="text-slate-400">—</span>
        </TableCell>
      </>
    );
  }

  const totalCost = Number(pricing.subtotalCost);
  const finalPrice = Number(pricing.finalPrice ?? 0);
  const variableCost = calculateContributionVariableCost(pricing);

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
    <>
      <TableCell>
        <span className="font-medium">
          {Number.isFinite(totalCost) ? formatCurrency(totalCost) : '—'}
        </span>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <span className={`font-semibold ${marginHealth.className}`}>
            {formatCurrency(finalPrice)}
          </span>
          <span
            className={`block text-xs ${marginHealth.className}`}
            title="Margem de contribuição calculada após materiais, mão de obra e custos indiretos"
          >
            {marginHealth.label}
            {isViable &&
              ` · ${contributionMarginPercent
                .toFixed(1)
                .replace('.', ',')}%`}
          </span>
        </div>
      </TableCell>
    </>
  );
}
