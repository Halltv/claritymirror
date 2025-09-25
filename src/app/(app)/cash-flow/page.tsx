/**
 * @fileoverview Página para a funcionalidade de análise de Fluxo de Caixa, agora integrada com dados de pedidos.
 *
 * Responsabilidades:
 * - Busca dados da coleção 'orders' no Firestore para usar como receitas.
 * - Exibe um estado de carregamento enquanto os dados são buscados.
 * - Passa os dados de receita e o formulário para o componente de cliente `CashFlowForm`.
 */

'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/auth-provider';
import type { Order } from '@/types';
import { PageHeader } from '@/components/page-header';
import { CashFlowForm } from './cash-flow-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function CashFlowPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      const getOrders = async () => {
        try {
          const q = query(collection(db, 'orders'), where('status', '!=', 'Cancelado'));
          const querySnapshot = await getDocs(q);
          const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
          setOrders(ordersData);
        } catch (error) {
          console.error("Failed to fetch orders from firestore", error);
        } finally {
          setLoading(false);
        }
      };
      
      getOrders();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const projectedIncomeFromOrders = orders.map(order => ({
    description: `Pedido ${order.id.substring(0, 7)}`,
    amount: order.amount,
  }));

  return (
    <>
      <PageHeader
        title="Fluxo de Caixa"
        description="Analise suas entradas e saídas para projetar seu saldo futuro."
      />
      <div className="max-w-4xl mx-auto">
        {loading || authLoading ? (
            <div className="grid lg:grid-cols-2 gap-8">
                <Skeleton className="h-[500px] w-full" />
                <Skeleton className="h-[300px] w-full" />
            </div>
        ) : (
            <CashFlowForm 
                initialProjectedIncome={projectedIncomeFromOrders} 
            />
        )}
      </div>
    </>
  );
}
