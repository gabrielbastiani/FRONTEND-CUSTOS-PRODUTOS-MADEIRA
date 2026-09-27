'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionIntro } from '@/components/ui/section-intro';
import { Plus } from 'lucide-react';
import { useKits } from '@/hooks/use-kits';
import { EntityThumbnail } from '@/components/shared/entity-thumbnail';
import { Kit } from '@/types';

function KitListItem({ kit }: { kit: Kit }) {
  return (
    <Card className="transition-colors hover:border-slate-400">
      <CardHeader className="flex flex-row items-center gap-3">
        <EntityThumbnail ownerType="kits" ownerId={kit.id} className="h-16 w-16" />

        <Link href={`/kits/${kit.id}`} className="flex-1">
          <CardTitle className="text-base">{kit.name}</CardTitle>
        </Link>
      </CardHeader>

      <Link href={`/kits/${kit.id}`}>
        <CardContent>
          <p className="text-sm text-slate-600">
            {kit.items.length} produto(s):{' '}
            {kit.items.map((item) => `${item.product.name} (x${item.quantity})`).join(', ')}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}

export default function KitsPage() {
  const { data: kits, isLoading } = useKits();

  return (
    <div className="space-y-6">
      <SectionIntro>
        Um kit agrupa dois ou mais produtos já cadastrados para serem vendidos juntos.
        O custo do kit é calculado somando o custo de cada produto (considerando a
        quantidade de cada um), e você define uma margem de lucro própria do kit,
        independente da margem de cada produto individual.
      </SectionIntro>

      <div className="flex justify-end">
        <Link href="/kits/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo kit
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!isLoading && kits && kits.length === 0 && (
        <p className="text-sm text-slate-500">
          Nenhum kit cadastrado ainda. Clique em &quot;Novo kit&quot; para agrupar
          produtos e calcular o preço de venda combinado.
        </p>
      )}

      <div className="space-y-3">
        {kits?.map((kit) => (
          <KitListItem key={kit.id} kit={kit} />
        ))}
      </div>
    </div>
  );
}