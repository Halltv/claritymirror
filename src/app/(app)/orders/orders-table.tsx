
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


const statusVariantMap: { [key in Order['status']]: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' } = {
  'Processando': 'default',
  'Enviado': 'secondary',
  'Entregue': 'success',
  'Cancelado': 'destructive',
  'Exceção': 'outline',
  'Faturado': 'success',
};

interface OrdersTableProps {
  orders: Order[];
  onOrderUpdate: (updatedOrder: Order) => void;
}

export function OrdersTable({ orders, onOrderUpdate }: OrdersTableProps) {
  const { toast } = useToast();

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
