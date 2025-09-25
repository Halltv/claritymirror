
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Wallet,
  ClipboardList,
  Users,
  Settings,
  FileText,
} from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import type { DialogProps } from '@radix-ui/react-dialog';
import { useAuth } from './auth-provider';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Painel' },
  { href: '/orcamentos', icon: ClipboardList, label: 'Orçamentos' },
  { href: '/orders', icon: Package, label: 'Pedidos' },
  { href: '/invoices', icon: FileText, label: 'NF-e' },
  { href: '/clientes', icon: Users, label: 'Clientes' },
  { href: '/usuarios', icon: Users, label: 'Usuários', adminOnly: true },
  { href: '/cash-flow', icon: Wallet, label: 'Fluxo de Caixa' },
  { href: '/configuracoes', icon: Settings, label: 'Configurações' },
];

export function CommandMenu({ ...props }: DialogProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.email === 'admin@claritymirror.com';

  const runCommand = React.useCallback((command: () => unknown) => {
    props.onOpenChange?.(false);
    command();
  }, [props]);

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <CommandDialog {...props}>
      <CommandInput placeholder="Digite um comando ou pesquise..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Navegação">
          {filteredNavItems.map((item) => (
            <CommandItem
              key={item.href}
              value={item.label}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
