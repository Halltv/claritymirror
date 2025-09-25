/**
 * @fileoverview Componente de cliente que gerencia a interatividade e o estado da página de Faturas (NF-e).
 *
 * Responsabilidades:
 * - Receber a lista inicial de faturas e mantê-la no estado.
 * - Renderizar a tabela de faturas.
 * - Gerenciar a abertura e o estado do diálogo `GenerateInvoiceDialog` para criar novas faturas.
 * - Implementar a lógica para cancelar uma fatura, que envolve:
 *   1. Atualizar o status da fatura para 'Cancelado' no Firestore.
 *   2. Reverter o valor e o status do pedido associado, se a fatura já estava 'Paga'.
 *   3. Atualizar o estado local para refletir a mudança na UI.
 * - Exibir toasts de feedback para o usuário.
 */

'use client';

import { useState } from 'react';
import { doc, updateDoc, collection, getDocs, query, where, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Invoice, Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { GenerateInvoiceDialog } from './generate-invoice-dialog';
import { PageHeader } from '@/components/page-header';

const statusVariantMap: { [key in Invoice['status']]: 'success' | 'warning' | 'destructive' } = {
  'Paga': 'success',
  'Pendente': 'warning',
  'Cancelado': 'destructive',
};

interface InvoicesContentProps {
    initialInvoices: Invoice[];
}

export function InvoicesContent({ initialInvoices }: InvoicesContentProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const { toast } = useToast();


  const handleInvoiceGenerated = (newInvoice: Invoice) => {
    setInvoices(prev => [newInvoice, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    // A lógica para atualizar o pedido associado já está no componente `orders-table.tsx`,
    // que recebe esta função como callback.
  };
  
  /**
   * Cancela uma fatura, atualizando seu status e revertendo o status do pedido associado se necessário.
   * @param invoiceToCancel A fatura a ser cancelada.
   */
  const handleCancelInvoice = async (invoiceToCancel: Invoice) => {
    if (invoiceToCancel.status === 'Cancelado') return;
    
    try {
        // 1. Atualiza o status da fatura para "Cancelado" no Firestore.
        const invoiceRef = doc(db, 'invoices', invoiceToCancel.id);
        await updateDoc(invoiceRef, { status: 'Cancelado' });

        // 2. Se a fatura era 'Paga', encontra o pedido associado e reverte seu status e valor pendente.
        if (invoiceToCancel.status === 'Paga' && invoiceToCancel.orderId) {
            const orderRef = doc(db, 'orders', invoiceToCancel.orderId);
            const orderDoc = await getDoc(orderRef);
            
            if (orderDoc.exists()) {
                const orderData = orderDoc.data() as Order;
                const newOutstanding = (orderData.outstanding || 0) + invoiceToCancel.total;

                await updateDoc(orderRef, {
                    // Reverte o status para 'Processando' para indicar que precisa de uma nova ação de faturamento.
                    status: 'Processando', 
                    outstanding: newOutstanding,
                });
            }
        }

        // 3. Atualiza o estado local para refletir a mudança na UI.
        setInvoices(prev => prev.map(inv => inv.id === invoiceToCancel.id ? { ...inv, status: 'Cancelado' } : inv));
        
        toast({
          title: 'Nota Fiscal Cancelada!',
          description: `A nota fiscal ${invoiceToCancel.invoiceNumber} foi marcada como cancelada.`,
          variant: 'destructive'
        });

    } catch (e) {
        console.error("Error cancelling invoice: ", e);
        toast({ title: 'Erro ao cancelar NF-e', variant: 'destructive'});
    }
  };
  
  const defaultTrigger = (
    <Button size="sm" className="gap-1">
      <PlusCircle className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
        Registrar NF-e
      </span>
    </Button>
  );


  return (
    <>
      <PageHeader
        title="Notas Fiscais (NF-e)"
        description="Gerencie e emita suas notas fiscais eletrônicas."
      >
         <GenerateInvoiceDialog 
            trigger={defaultTrigger}
            onInvoiceGenerated={handleInvoiceGenerated}
          />
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Faturas</CardTitle>
          <CardDescription>
            Aqui está a lista de todas as notas fiscais emitidas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[60px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.orderId.substring(0, 7)}...</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[invoice.status]}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {invoice.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                   <TableCell className="text-right">
                     {invoice.status !== 'Cancelado' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleCancelInvoice(invoice)}>
                              Cancelar NF-e
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                     )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
