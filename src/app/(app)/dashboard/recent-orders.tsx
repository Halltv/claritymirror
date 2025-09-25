import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import type { Order } from "@/types";

interface RecentOrdersProps {
  orders: Order[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Nenhum pedido recente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://picsum.photos/seed/${order.customer.email}/100/100`} alt="Avatar" data-ai-hint="company logo" />
            <AvatarFallback>{order.customer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none text-primary">{order.customer.name}</p>
            <p className="text-sm text-muted-foreground">
              {order.customer.email}
            </p>
          </div>
          <div className="ml-auto font-medium">+R$ {order.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
      ))}
    </div>
  );
}
