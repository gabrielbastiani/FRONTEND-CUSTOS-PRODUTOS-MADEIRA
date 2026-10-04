'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  isNavigationItemActive,
  navigationGroups,
  standaloneItems,
} from './sidebar';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/suppliers': 'Fornecedores',
  '/raw-materials': 'Matérias-primas',
  '/labor-rates': 'Mão de obra',
  '/products': 'Produtos',
  '/kits': 'Kits de Produtos',
  '/quotes': 'Orçamentos',
  '/simulador': 'Simulador',
  '/profit-goal': 'Quanto preciso vender',
  '/marketplace-calculator': 'Calculadora de Marketplace',
  '/marketplace-settings': 'Taxas de Marketplace',
  '/settings/workshop': 'Configurações da oficina',
  '/business-goal': 'Meta do negócio',
};

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const matchingTitle = Object.entries(titles)
    .filter(([path]) => path !== '/' && pathname.startsWith(path))
    .sort(([pathA], [pathB]) => pathB.length - pathA.length)[0]?.[1];

  const title = matchingTitle ?? titles[pathname] ?? 'Wood Pricing';

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setOpenGroup(null);
  };

  return (
    <>
      <header className="relative z-40 flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
        <h1 className="truncate text-lg font-semibold text-slate-800 sm:text-xl">
          {title}
        </h1>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 md:hidden"
          aria-label={
            isMenuOpen
              ? 'Fechar menu de navegação'
              : 'Abrir menu de navegação'
          }
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => {
            setIsMenuOpen((open) => !open);
            setOpenGroup(null);
          }}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </header>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Navegação principal"
          className="fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto border-t bg-white p-4 shadow-lg md:hidden"
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
                  onClick={closeMobileMenu}
                  className={cn(
                    'flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
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

            <div className="space-y-1 pt-3">
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
                        'flex min-h-11 w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors',
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
                              onClick={closeMobileMenu}
                              className={cn(
                                'flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
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
          </div>
        </nav>
      )}
    </>
  );
}