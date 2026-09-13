'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSuppliers } from '@/hooks/use-suppliers';
import { useRawMaterials } from '@/hooks/use-raw-materials';
import { useLaborRates } from '@/hooks/use-labor-rates';
import { useProducts } from '@/hooks/use-products';
import { Truck, TreePine, Users, Package } from 'lucide-react';

export default function DashboardPage() {
  const { data: suppliers } = useSuppliers();
  const { data: materials } = useRawMaterials();
  const { data: laborRates } = useLaborRates();
  const { data: products } = useProducts();

  const cards = [
    {
      title: 'Fornecedores',
      value: suppliers?.length ?? 0,
      icon: Truck,
      href: '/suppliers',
    },
    {
      title: 'Matérias-primas',
      value: materials?.length ?? 0,
      icon: TreePine,
      href: '/raw-materials',
    },
    {
      title: 'Tipos de mão de obra',
      value: laborRates?.length ?? 0,
      icon: Users,
      href: '/labor-rates',
    },
    {
      title: 'Produtos',
      value: products?.length ?? 0,
      icon: Package,
      href: '/products',
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Visão geral do seu sistema de precificação de produtos em madeira.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    {card.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {products && products.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <p className="text-slate-600">
              Comece cadastrando fornecedores e matérias-primas, depois monte seu primeiro
              produto para calcular o custo.
            </p>
            <Link href="/suppliers" className="text-sm font-medium text-slate-900 underline">
              Cadastrar primeiro fornecedor
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}