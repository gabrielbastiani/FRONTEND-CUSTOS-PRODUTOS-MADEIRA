'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Calculator,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Package,
  Package2,
  Settings,
  Sparkles,
  Target,
  TreePine,
  TrendingUp,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';

export type NavigationItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

export type NavigationGroup = {
  label: string;
  icon: typeof LayoutDashboard;
  children: NavigationItem[];
};

export const standaloneItems: NavigationItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/suppliers', label: 'Fornecedores', icon: Truck },
  { href: '/raw-materials', label: 'Matérias-primas', icon: TreePine },
  { href: '/labor-rates', label: 'Mão de obra', icon: Users },
];

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'Produtos',
    icon: Package,
    children: [
      { href: '/products', label: 'Todos os produtos', icon: Package },
      { href: '/kits', label: 'Kits de Produtos', icon: Package2 },
    ],
  },
  {
    label: 'Orçamentos',
    icon: FileText,
    children: [
      { href: '/quotes', label: 'Orçamentos', icon: FileText },
      { href: '/simulador', label: 'Simulador', icon: Sparkles },
    ],
  },
  {
    label: 'Marketplaces',
    icon: Calculator,
    children: [
      {
        href: '/marketplace-calculator',
        label: 'Calculadora de Marketplace',
        icon: Calculator,
      },
      {
        href: '/marketplace-settings',
        label: 'Taxas de Marketplace',
        icon: Settings,
      },
    ],
  },
  {
    label: 'Configurações da oficina',
    icon: Wrench,
    children: [
      {
        href: '/settings/workshop',
        label: 'Configurações da oficina',
        icon: Wrench,
      },
      {
        href: '/business-goal',
        label: 'Meta do negócio',
        icon: Target,
      },
      {
        href: '/profit-goal',
        label: 'Quanto preciso vender',
        icon: TrendingUp,
      },
    ],
  },
];

export function isNavigationItemActive(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-white md:flex">
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <span className="text-lg font-semibold text-slate-800">
          Wood Pricing
        </span>
      </div>

      <nav
        aria-label="Navegação principal"
        className="flex-1 space-y-4 overflow-y-auto p-4"
      >
        <div className="space-y-1">
          {standaloneItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavigationItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          {navigationGroups.map((group) => {
            const GroupIcon = group.icon;
            const groupIsActive = group.children.some((item) =>
              isNavigationItemActive(pathname, item.href)
            );
            const isOpen = openGroup === group.label;

            return (
              <section key={group.label}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpenGroup((current) =>
                      current === group.label ? null : group.label
                    )
                  }
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors',
                    groupIsActive
                      ? 'text-slate-900'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <GroupIcon
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{group.label}</span>
                  </span>

                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform',
                      isOpen && 'rotate-180'
                    )}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-3">
                    {group.children.map((item) => {
                      const Icon = item.icon;
                      const isActive = isNavigationItemActive(
                        pathname,
                        item.href
                      );

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={isActive ? 'page' : undefined}
                          className={cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                            isActive
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          )}
                        >
                          <Icon
                            className="h-4 w-4 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}