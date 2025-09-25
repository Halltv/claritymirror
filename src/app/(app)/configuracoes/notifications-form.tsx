
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  FormDescription,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const notificationsFormSchema = z.object({
  dailySummary: z.boolean().default(false).optional(),
  approvedQuotes: z.boolean().default(true).optional(),
  newOrders: z.boolean().default(true).optional(),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

const defaultValues: Partial<NotificationsFormValues> = {
  dailySummary: false,
  approvedQuotes: true,
  newOrders: true,
};

export function NotificationsForm() {
  const { toast } = useToast();

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues,
  });

  function onSubmit(data: NotificationsFormValues) {
    toast({
      title: 'Preferências salvas!',
      description: 'Suas configurações de notificação foram atualizadas.',
    });
    console.log(data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
        <CardDescription>
          Configure como você deseja receber notificações.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="dailySummary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Resumo Diário</FormLabel>
                      <FormDescription>
                        Receba um resumo diário das atividades da sua conta por e-mail.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="approvedQuotes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Orçamentos Aprovados</FormLabel>
                      <FormDescription>
                        Seja notificado imediatamente quando um cliente aprovar um orçamento.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newOrders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Novos Pedidos</FormLabel>
                      <FormDescription>
                        Receba uma notificação assim que um novo pedido for gerado.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">Salvar Preferências</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
