
'use client';

import { useTheme } from 'next-themes';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

const themeFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    required_error: 'Por favor, selecione um tema.',
  }),
});

type ThemeFormValues = z.infer<typeof themeFormSchema>;

export function ThemeSettingsForm() {
  const { setTheme, theme } = useTheme();
  const { toast } = useToast();

  const form = useForm<ThemeFormValues>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: {
      theme: (theme as ThemeFormValues['theme']) || 'system',
    },
  });

  function onSubmit(data: ThemeFormValues) {
    setTheme(data.theme);
    toast({
      title: 'Tema atualizado!',
      description: `O tema foi alterado para ${data.theme}.`,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tema</CardTitle>
        <CardDescription>
          Selecione o tema para o painel de controle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Aparência</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="light" />
                        </FormControl>
                        <FormLabel className="font-normal">Claro</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="dark" />
                        </FormControl>
                        <FormLabel className="font-normal">Escuro</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="system" />
                        </FormControl>
                        <FormLabel className="font-normal">Sistema</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Salvar Tema</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
