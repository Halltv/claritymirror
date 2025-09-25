
/**
 * @fileoverview Componente do menu do usuário no canto superior direito.
 *
 * Responsabilidades:
 * - Exibir o avatar do usuário logado.
 * - Prover um menu dropdown com opções como "Perfil", "Configurações" e "Sair".
 * - Implementar a funcionalidade de logout, chamando a função `logout` do `useAuth`.
 * - Permitir a troca de tema (claro/escuro/sistema).
 */

"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, LogOut, User, Settings, Users } from "lucide-react";
import { useAuth } from "./auth-provider";

export function UserNav() {
  const { setTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const isAdmin = user?.email === 'admin@claritymirror.com';


  const getInitials = (nameOrEmail?: string | null) => {
    if (!nameOrEmail) return "U";
    const parts = nameOrEmail.split(' ');
    if (parts.length > 1 && parts[0] && parts[1]) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameOrEmail.substring(0, 2).toUpperCase();
  }

  const handleLogout = async () => {
    try {
      await logout();
      // O AuthProvider cuidará do redirecionamento para /login
    } catch (error) {
      console.error("Falha ao fazer logout:", error);
      // Opcional: mostrar um toast de erro
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{getInitials(user?.displayName || user?.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName || 'Usuário'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user ? user.email : "Carregando..."}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/perfil')}>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
           {isAdmin && (
            <DropdownMenuItem onClick={() => router.push('/usuarios')}>
              <Users className="mr-2 h-4 w-4" />
              <span>Usuários</span>
              <DropdownMenuShortcut>⌘U</DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => router.push('/configuracoes')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="ml-2">Tema</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Escuro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  Sistema
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
