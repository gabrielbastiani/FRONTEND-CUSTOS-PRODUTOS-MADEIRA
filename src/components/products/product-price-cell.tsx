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
    return <Skeleton className="h-4 w-20" />;
  }

  if (isError || !pricing) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <span className="font-semibold text-emerald-700">
      {formatCurrency(pricing.finalPrice)}
    </span>
  );
}