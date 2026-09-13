'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/hooks/use-products';
import { ProductsTable } from '@/components/products/products-table';

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Monte produtos combinando matérias-primas e mão de obra para calcular o custo final.
        </p>
        <Link href="/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo produto
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <ProductsTable products={products ?? []} />
      )}
    </div>
  );
}