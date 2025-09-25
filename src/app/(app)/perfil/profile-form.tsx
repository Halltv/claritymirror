
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  displayName: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      displayName: user?.displayName || '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: ProfileFormValues) {
    if (!user) {
      toast({ title: 'Usuário não encontrado', variant: 'destructive' });
      return;
    }

    try {
      await updateProfile(user, {
        displayName: data.displayName,
        photoURL: '', // Remove a photoURL ao atualizar
      });

      toast({
        title: 'Perfil Atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
      
      // Forçar uma recarga para que o user-nav e outros componentes peguem os novos dados.
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível salvar suas informações.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nome de Exibição</CardTitle>
        <CardDescription>
          Atualize seu nome de exibição. A funcionalidade de foto de perfil está desativada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Exibição</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
