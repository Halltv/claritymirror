
/**
 * @fileoverview Componente de cliente que gerencia a interatividade e o estado da página de Usuários.
 *
 * Responsabilidades:
 * - Receber a lista inicial de usuários.
 * - Renderizar a tabela de usuários ou um estado de boas-vindas se não houver usuários.
 * - Gerenciar a abertura e o estado do diálogo `NovoUsuarioDialog` para criar novos usuários.
 * - Chamar a Server Action `createUser` para adicionar um novo usuário no Firebase Auth.
 * - Atualizar o estado local para refletir a adição na UI.
 * - Exibir toasts de feedback para o usuário.
 */
'use client';

import { useState } from 'react';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { NovoUsuarioDialog } from './novo-usuario-dialog';
import type { AppUser, NewUser } from '@/types/user';
import { createUser } from './actions';


interface UsersContentProps {
  initialUsers: AppUser[];
}

export function UsersContent({ initialUsers }: UsersContentProps) {
  const [users, setUsers] = useState(initialUsers);
  const { toast } = useToast();

  const getInitials = (nameOrEmail?: string | null) => {
    if (!nameOrEmail) return "U";
    const parts = nameOrEmail.split(' ');
    if (parts.length > 1 && parts[0] && parts[1]) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameOrEmail.substring(0, 2).toUpperCase();
  }

  const handleUserCreated = async (newUserData: NewUser) => {
    const result = await createUser(newUserData);
    if (result.success && result.user) {
      setUsers(prev => [result.user, ...prev]);
      toast({
        title: "Usuário Criado!",
        description: `O usuário ${result.user.email} foi adicionado com sucesso.`,
      });
      return true;
    } else {
      console.error(result.error);
      toast({
        title: 'Erro ao criar usuário',
        description: result.error || 'Não foi possível completar a operação.',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  return (
    <>
      <PageHeader
        title="Gerenciamento de Usuários"
        description="Adicione, remova e gerencie os acessos dos usuários ao sistema."
      >
        <NovoUsuarioDialog onUserCreated={handleUserCreated} />
      </PageHeader>
      
       {users.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-96">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              Nenhum usuário encontrado
            </h3>
            <p className="text-sm text-muted-foreground">
              Comece a adicionar usuários para permitir o acesso ao painel.
            </p>
            <div className="mt-4">
              <NovoUsuarioDialog onUserCreated={handleUserCreated} isTrigger />
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Usuários do Sistema</CardTitle>
            <CardDescription>
              A lista de todos os usuários com acesso à plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-[60px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                    <TableRow key={user.uid}>
                        <TableCell className="font-medium flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                               <span className="text-primary">{user.displayName || 'Sem nome'}</span>
                               <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={user.disabled ? 'destructive' : 'secondary'}>
                                {user.disabled ? 'Inativo' : 'Ativo'}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                         <TableCell className="text-right">
                           {/* Ações como desativar ou deletar usuário irão aqui */}
                        </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
