/**
 * @fileoverview Componente de cliente que gerencia o estado e a interatividade da página de Pedidos.
 *
 * Responsabilidades:
 * - Receber a lista inicial de pedidos e mantê-la em um estado local (`orders`).
 * - Fornecer a funcionalidade para exportar a lista de pedidos para um arquivo CSV.
 * - Renderizar o cabeçalho da página e o `OrdersTable` com os dados e callbacks necessários.
 * - Atualizar a lista de pedidos quando um pedido é modificado (ex: faturado).
 */
'use client';

import { useState } from 'react';
import type { Order } from '@/types';
import { PageHeader } from "@/components/page-header";
import { OrdersTable } from "./orders-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File } from 'lucide-react';

/**
 * Propriedades para o componente `OrdersPageContent`.
 */
interface OrdersPageContentProps {
  /** A lista de pedidos buscada inicialmente do servidor. */
  initialOrders: Order[];
}

/**
 * Componente que renderiza o conteúdo principal da página de Pedidos.
 * @param {OrdersPageContentProps} props As propriedades do componente.
 */
export function OrdersPageContent({ initialOrders }: OrdersPageContentProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  /**
   * Callback para atualizar um único pedido no estado local.
   * @param updatedOrder O objeto do pedido com os dados atualizados.
   */
  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
  };

  /**
   * Converte a lista de pedidos para CSV e inicia o download.
   */
  const exportToCsv = () => {
    const headers = ['Pedido', 'Cliente', 'Email', 'Data', 'Status', 'Total', 'Pendente'];
    
    const rows = orders.map(order => [
      order.id,
      order.customer.name,
      order.customer.email,
      new Date(order.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
      order.status,
      order.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      order.outstanding.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    ].join(';'));

    const csvContent = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "pedidos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };


  return (
    <>
      <PageHeader 
        title="Pedidos" 
        description="Gerencie o status financeiro e operacional dos seus pedidos." 
      />
      
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Histórico de Pedidos</CardTitle>
            <CardDescription>
              Gerencie o status financeiro dos pedidos e emita as notas fiscais.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" className="gap-1" onClick={exportToCsv}>
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Exportar
            </span>
          </Button>
        </CardHeader>
        <CardContent>
           <OrdersTable 
              orders={orders} 
              onOrderUpdate={handleOrderUpdate}
            />
        </CardContent>
      </Card>
    </>
  );
}
