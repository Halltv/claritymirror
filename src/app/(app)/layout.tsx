/**
 * @fileoverview Layout principal da aplicação para rotas autenticadas.
 *
 * Responsabilidades:
 * - Prover a estrutura visual comum a todas as páginas da aplicação, incluindo o menu lateral e o cabeçalho.
 * - Gerenciar o estado de colapso do menu lateral (`isCollapsed`).
 * - Implementar o menu lateral responsivo, que se transforma em um `Sheet` (menu off-canvas) em telas pequenas.
 * - Incluir componentes globais como `UserNav` (menu do usuário) e `CommandMenu` (barra de busca/comandos).
 * - Envolver o conteúdo com o AuthProvider para garantir que apenas usuários autenticados acessem esta área.
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { PanelLeft, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { UserNav } from "@/components/user-nav";
import { MainNav } from "@/components/main-nav";
import { Logo } from "@/components/icons";
import { cn } from "@/lib/utils";
import { CommandMenu } from "@/components/command-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = React.useState(false);


  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandMenuOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <TooltipProvider>
          <CommandMenu open={isCommandMenuOpen} onOpenChange={setIsCommandMenuOpen} />
          <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <aside
              className={cn(
                "fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-background transition-all duration-300 sm:flex",
                isCollapsed ? "w-14" : "w-60"
              )}
            >
              <div
                className={cn(
                  "flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6",
                  isCollapsed && "justify-center"
                )}
              >
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 font-semibold"
                >
                  <Logo className="h-6 w-6" />
                  <span className={cn(isCollapsed && "sr-only")}>ClarityMirror</span>
                </Link>
              </div>
              <div className="flex-1 mt-4">
                <MainNav isCollapsed={isCollapsed} />
              </div>
            </aside>
            <div
              className={cn(
                "flex flex-col transition-all duration-300",
                isCollapsed ? "sm:pl-14" : "sm:pl-60"
              )}
            >
              <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:pt-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 hidden sm:flex"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  <PanelLeft className="h-4 w-4" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="sm:hidden">
                      <PanelLeft className="h-5 w-5" />
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="sm:max-w-xs">
                    <nav className="grid gap-6 text-lg font-medium">
                      <Link
                        href="#"
                        className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                      >
                        <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                        <span className="sr-only">ClarityMirror</span>
                      </Link>
                      <MainNav isCollapsed={false} />
                    </nav>
                  </SheetContent>
                </Sheet>
                <div className="relative ml-auto flex-1 md:grow-0">
                  <Button
                    variant="outline"
                    className="flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-[200px] lg:w-[320px]"
                    onClick={() => setIsCommandMenuOpen(true)}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      <span>Buscar...</span>
                    </div>
                    <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </Button>
                </div>
                <UserNav />
              </header>
              <main className="flex-1 p-4 sm:p-6">{children}</main>
            </div>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
