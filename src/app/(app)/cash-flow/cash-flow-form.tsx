/**
 * @fileoverview Componente de cliente que renderiza o formulário interativo de projeção de fluxo de caixa.
 *
 * Responsabilidades:
 * - Gerenciar o estado do formulário para saldo atual e despesas projetadas.
 * - Utilizar `react-hook-form` e `zod` para validação dos dados de entrada.
 * - Permitir a adição e remoção dinâmica de campos de despesa.
 * - Calcular e exibir o resultado da projeção (total de receitas, despesas e fluxo de caixa projetado).
 * - Exibir estados de carregamento durante o cálculo.
 */

'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, PlusCircle, Calculator, Trash2, TrendingUp, ShoppingBag } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

/**
 * Esquema de validação para um item de receita ou despesa.
 */
const projectedItemSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória.'),
  amount: z.coerce.number().min(0, 'Valor deve ser positivo.'),
});

/**
 * Esquema de validação para o formulário principal de fluxo de caixa.
 */
const formSchema = z.object({
  currentBalance: z.coerce.number().min(0, 'O saldo deve ser positivo.'),
  projectedExpenses: z.array(projectedItemSchema).min(1, 'Adicione ao menos uma despesa.'),
});

type FormValues = z.infer<typeof formSchema>;
type ProjectedItem = z.infer<typeof projectedItemSchema>;

/**
 * Estrutura do objeto que armazena o resultado do cálculo do fluxo de caixa.
 */
interface CalculationResult {
    projectedCashFlow: number;
    totalIncome: number;
    totalExpenses: number;
}

/**
 * Propriedades para o componente `CashFlowForm`.
 */
interface CashFlowFormProps {
    /**
     * Lista de receitas projetadas, geralmente vindas de pedidos faturados.
     */
    initialProjectedIncome: ProjectedItem[];
}

/**
 * Componente de formulário para cálculo de projeção de fluxo de caixa.
 * @param {CashFlowFormProps} props As propriedades do componente.
 */
export function CashFlowForm({ initialProjectedIncome }: CashFlowFormProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentBalance: 10000,
      projectedExpenses: [
        { description: 'Aluguel', amount: 3000 },
        { description: 'Folha de Pagamento', amount: 8000 },
      ],
    },
  });

  const { fields: expenseFields, append: appendExpense, remove: removeExpense } = useFieldArray({
    control: form.control,
    name: 'projectedExpenses',
  });

  /**
   * Manipula a submissão do formulário, calcula e exibe os resultados da projeção.
   * @param data Os dados validados do formulário.
   */
  async function onSubmit(data: FormValues) {
    setLoading(true);
    setResult(null);

    // Simula um pequeno delay para a UI
    await new Promise(resolve => setTimeout(resolve, 500));

    const totalIncome = initialProjectedIncome.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = data.projectedExpenses.reduce((sum, item) => sum + item.amount, 0);
    const projectedCashFlow = data.currentBalance + totalIncome - totalExpenses;

    setResult({ projectedCashFlow, totalIncome, totalExpenses });
    setLoading(false);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Dados Financeiros</CardTitle>
          <CardDescription>Insira os dados para a projeção.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="currentBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo Atual (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10000.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    Receitas (de Pedidos Faturados)
                </h3>
                <ScrollArea className="h-40 w-full rounded-md border p-4">
                  {initialProjectedIncome.length > 0 ? (
                    initialProjectedIncome.map((income, index) => (
                      <div key={index} className="flex justify-between items-center text-sm mb-2">
                        <span>{income.description}</span>
                        <span className="font-medium text-primary">
                          + R$ {income.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">Nenhuma receita de pedidos encontrada.</p>
                  )}
                </ScrollArea>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Despesas Projetadas</h3>
                {expenseFields.map((field, index) => (
                   <div key={field.id} className="flex gap-2 mb-2 items-end">
                    <FormField
                      control={form.control}
                      name={`projectedExpenses.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className={index !== 0 ? 'sr-only' : ''}>Descrição</FormLabel>
                          <FormControl><Input placeholder="Aluguel" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name={`projectedExpenses.${index}.amount`}
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel className={index !== 0 ? 'sr-only' : ''}>Valor (R$)</FormLabel>
                           <FormControl><Input type="number" placeholder="2000" {...field} /></FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeExpense(index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendExpense({ description: '', amount: 0 })}><PlusCircle className="w-4 h-4 mr-2" />Adicionar Despesa</Button>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                Calcular Projeção
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Resultado da Projeção</CardTitle>
          <CardDescription>Análise do seu fluxo de caixa.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Calculando...</p>
            </div>
          )}
          {result && (
            <div className="w-full space-y-6 text-center">
               <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-sm text-muted-foreground">Total de Receitas</p>
                    <p className="text-2xl font-bold text-primary">
                        R$ {result.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                 <div>
                    <p className="text-sm text-muted-foreground">Total de Despesas</p>
                    <p className="text-2xl font-bold text-destructive">
                        R$ {result.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Fluxo de Caixa Projetado</p>
                <p className={`text-4xl font-bold ${result.projectedCashFlow >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  R$ {result.projectedCashFlow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
          {!loading && !result && (
            <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
                <TrendingUp className="w-10 h-10" />
                <p>Seus resultados aparecerão aqui.</p>
                <p className="text-xs max-w-xs">Preencha os dados e clique em "Calcular Projeção" para ver a análise do seu fluxo de caixa.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
