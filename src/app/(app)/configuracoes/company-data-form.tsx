
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

const companyDataSchema = z.object({
  companyName: z.string().min(2, 'O nome da empresa é obrigatório.'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Insira um email válido.').optional().or(z.literal('')),
});

type CompanyDataValues = z.infer<typeof companyDataSchema>;

// Valores de exemplo, em um app real viriam do banco de dados
const defaultValues: CompanyDataValues = {
    companyName: 'ClarityMirror',
    address: 'Rua das Inovações, 123, São Paulo - SP',
    phone: '(11) 4004-4004',
    email: 'contato@claritymirror.com',
}

export function CompanyDataForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CompanyDataValues>({
    resolver: zodResolver(companyDataSchema),
    defaultValues,
  });

  // Função de exemplo para salvar os dados
  async function onSubmit(data: CompanyDataValues) {
    setIsSubmitting(true);
    console.log("Dados da empresa salvos:", data);
    
    // Simula uma chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Dados da Empresa Salvos!',
      description: 'As informações da sua empresa foram atualizadas com sucesso.',
    });
    setIsSubmitting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da Empresa (Admin)</CardTitle>
        <CardDescription>
          Estas informações serão usadas nos orçamentos e documentos gerados.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl><Input placeholder="Sua Empresa LTDA" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl><Input placeholder="Rua, Número, Cidade - Estado" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl><Input placeholder="(XX) XXXXX-XXXX" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email de Contato</FormLabel>
                        <FormControl><Input type="email" placeholder="contato@suaempresa.com" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Dados da Empresa
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
