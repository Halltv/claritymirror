/**
 * @fileoverview Diálogo de formulário para criação de um novo usuário.
 * 
 * Responsabilidades:
 * - Apresentar um formulário para inserir email, nome e senha.
 * - Utilizar `react-hook-form` e `zod` para validação dos dados.
 * - Chamar a função `onUserCreated` (uma Server Action) ao submeter o formulário.
 * - Gerenciar o estado de abertura/fechamento do diálogo e o estado de submissão.
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import type { NewUser } from '@/types/user';

const newUserSchema = z.object({
  displayName: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  email: z.string().email('Insira um email válido.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

type UserFormValues = z.infer<typeof newUserSchema>;

interface NovoUsuarioDialogProps {
  onUserCreated: (user: NewUser) => Promise<boolean>;
  disabled?: boolean;
  isTrigger?: boolean;
}

export function NovoUsuarioDialog({ onUserCreated, disabled = false, isTrigger = false }: NovoUsuarioDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    }
  });

  async function onSubmit(data: UserFormValues) {
    setIsSubmitting(true);
    const success = await onUserCreated(data);
    setIsSubmitting(false);
    
    if (success) {
      setOpen(false);
      form.reset();
    }
  }

  const triggerButton = (
    <Button size={isTrigger ? 'default' : 'sm'} className="gap-1" disabled={disabled}>
        <PlusCircle className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Novo Usuário
        </span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar um novo acesso ao sistema.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="joao.silva@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Usuário'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
