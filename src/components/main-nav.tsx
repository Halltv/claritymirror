
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  Package,
  Wallet,
  ClipboardList,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "./auth-provider";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Painel",
  },
  {
    href: "/orcamentos",
    icon: ClipboardList,
    label: "Orçamentos",
  },
  {
    href: "/orders",
    icon: Package,
    label: "Pedidos",
  },
  {
    href: "/invoices",
    icon: FileText,
    label: "NF-e",
  },
  {
    href: "/clientes",
    icon: Users,
    label: "Clientes",
  },
  {
    href: "/cash-flow",
    icon: Wallet,
    label: "Fluxo de Caixa",
  },
];

export function MainNav({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.email === 'admin@claritymirror.com';

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="flex flex-col gap-1 px-2">
      {filteredNavItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Tooltip key={item.href} delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md p-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "h-9 w-9 justify-center p-0"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className={cn("sr-only", !isCollapsed && "not-sr-only")}>
                  {item.label}
                </span>
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">{item.label}</TooltipContent>
            )}
          </Tooltip>
        );
      })}
    </nav>
  );
}
