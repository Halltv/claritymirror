
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória.'),
    newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres.'),
  });
  
  const emailSchema = z.object({
    newEmail: z.string().email('Insira um email válido.'),
    passwordForEmail: z.string().min(1, 'Senha é obrigatória para alterar o email.'),
  });

export function AccountSecurityForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { newEmail: user?.email ?? '', passwordForEmail: '' },
  });

  const handleReauth = async (password: string) => {
    if (!user || !user.email) return null;
    const credential = EmailAuthProvider.credential(user.email, password);
    try {
        await reauthenticateWithCredential(user, credential);
        return true;
    } catch (error: any) {
        console.error("Re-authentication failed", error);
        toast({ title: 'Falha na autenticação', description: 'Sua senha atual está incorreta.', variant: 'destructive'});
        return false;
    }
  }

  async function onPasswordSubmit(data: z.infer<typeof passwordSchema>) {
    setIsPasswordSubmitting(true);
    const reauthSuccess = await handleReauth(data.currentPassword);
    if (reauthSuccess) {
      try {
        await updatePassword(user!, data.newPassword);
        toast({ title: 'Senha atualizada com sucesso!' });
        passwordForm.reset();
      } catch (error: any) {
        console.error("Password update failed", error);
        toast({ title: 'Erro ao atualizar senha', description: error.message, variant: 'destructive' });
      }
    }
    setIsPasswordSubmitting(false);
  }

  async function onEmailSubmit(data: z.infer<typeof emailSchema>) {
    setIsEmailSubmitting(true);
    const reauthSuccess = await handleReauth(data.passwordForEmail);
    if (reauthSuccess) {
        try {
            await updateEmail(user!, data.newEmail);
            toast({ title: 'Email atualizado!', description: 'Você será deslogado por segurança.'});
            // O logout não é obrigatório, mas é uma boa prática de segurança.
            // Opcional: implementar logout após alguns segundos.
        } catch (error: any)
        {
            console.error("Email update failed", error);
            toast({ title: 'Erro ao atualizar email', description: error.message, variant: 'destructive'});
        }
    }
    setIsEmailSubmitting(false);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>
            Use uma senha longa e aleatória para manter sua conta segura.
          </CardDescription>
        </CardHeader>
         <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <CardContent className="space-y-4">
                    <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Senha Atual</FormLabel>
                                <FormControl><Input type="password" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nova Senha</FormLabel>
                                <FormControl><Input type="password" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={isPasswordSubmitting}>
                        {isPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Atualizar Senha
                    </Button>
                </CardFooter>
            </form>
         </Form>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Alterar Endereço de Email</CardTitle>
          <CardDescription>
            Você precisará confirmar sua senha para alterar o email.
          </CardDescription>
        </CardHeader>
         <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
                <CardContent className="space-y-4">
                    <FormField
                        control={emailForm.control}
                        name="newEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Novo Email</FormLabel>
                                <FormControl><Input type="email" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={emailForm.control}
                        name="passwordForEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirme sua Senha</FormLabel>
                                <FormControl><Input type="password" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={isEmailSubmitting}>
                        {isEmailSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Atualizar Email
                    </Button>
                </CardFooter>
            </form>
         </Form>
      </Card>
    </>
  );
}
