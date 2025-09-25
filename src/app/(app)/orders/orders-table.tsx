/**
 * @fileoverview Componente que renderiza a tabela de pedidos.
 *
 * Responsabilidades:
 * - Exibir os dados dos pedidos em uma tabela estruturada.
 * - Mostrar o status de cada pedido com um `Badge` colorido.
 * - Fornecer um menu de ações (`DropdownMenu`) para cada pedido, como "Marcar como Faturado".
 * - Lidar com a lógica de atualização do status de um pedido no Firestore quando uma ação é acionada.
 * - Invocar o callback `onOrderUpdate` para notificar o componente pai sobre a mudança de estado.
 */

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import type { Order } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/** Mapeia o status do pedido para a variante de cor do Badge. */
const statusVariantMap: { [key in Order['status']]: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' } = {
  'Processando': 'default',
  'Enviado': 'secondary',
  'Entregue': 'success',
  'Cancelado': 'destructive',
  'Exceção': 'outline',
  'Faturado': 'success',
};

/** Propriedades para o componente `OrdersTable`. */
interface OrdersTableProps {
  /** A lista de pedidos a ser renderizada. */
  orders: Order[];
  /** Função de callback para notificar o componente pai sobre uma atualização de pedido. */
  onOrderUpdate: (updatedOrder: Order) => void;
}

/**
 * Renderiza uma tabela de pedidos com ações.
 * @param {OrdersTableProps} props As propriedades do componente.
 */
export function OrdersTable({ orders, onOrderUpdate }: OrdersTableProps) {
  const { toast } = useToast();

  /**
   * Marca um pedido como 'Faturado' e zera o valor pendente.
   * Esta é uma ação de controle interno.
   * @param orderToBill O pedido a ser faturado.
   */
  const handleMarkAsBilled = async (orderToBill: Order) => {
    if (orderToBill.outstanding === 0) return;

    try {
      const orderRef = doc(db, 'orders', orderToBill.id);
      await updateDoc(orderRef, {
        status: 'Faturado',
        outstanding: 0,
      });

      const updatedOrder = {...orderToBill, status: 'Faturado', outstanding: 0};
      onOrderUpdate(updatedOrder);

      toast({
        title: "Pedido Faturado!",
        description: "O pedido foi marcado como faturado (controle interno)."
      })

    } catch (e) {
      console.error("Error marking order as billed:", e);
      toast({ title: 'Erro ao faturar pedido', variant: 'destructive'});
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Pendente</TableHead>
            <TableHead className="w-[60px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id.substring(0, 7)}...</TableCell>
              <TableCell>{order.customer.name}</TableCell>
              <TableCell>{new Date(order.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
              <TableCell>
                <Badge variant={statusVariantMap[order.status]}>{order.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                R$ {order.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right">
                R$ {order.outstanding.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem 
                      disabled={order.outstanding <= 0} 
                      onClick={() => handleMarkAsBilled(order)}
                    >
                      Marcar como Faturado
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
