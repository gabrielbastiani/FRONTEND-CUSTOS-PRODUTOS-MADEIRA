'use client';

import { usePathname } from 'next/navigation';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/suppliers': 'Fornecedores',
  '/raw-materials': 'Matérias-primas',
  '/labor-rates': 'Mão de obra',
  '/products': 'Produtos',
};

export function Header() {
  const pathname = usePathname();
  const title =
    Object.entries(titles).find(([path]) => pathname.startsWith(path) && path !== '/')?.[1] ||
    titles[pathname] ||
    'Wood Pricing';

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
    </header>
  );
}