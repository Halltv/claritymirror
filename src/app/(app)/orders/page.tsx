/**
 * @fileoverview Página de Pedidos, agora como um componente de cliente para lidar com regras de segurança.
 *
 * Responsabilidades:
 * - Esperar a confirmação de autenticação do usuário usando o hook `useAuth`.
 * - Buscar a lista de todos os pedidos do banco de dados Firestore somente após o usuário ser autenticado.
 * - Exibir um estado de carregamento enquanto os dados são buscados.
 * - Passar os dados para o componente `OrdersPageContent` para renderização.
 */
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/types';
import { OrdersPageContent } from './orders-page-content';
import { useAuth } from '@/components/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Só busca os dados se a autenticação foi checada e existe um usuário logado.
    if (!authLoading && user) {
      const getOrders = async () => {
        try {
          const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
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
        // Se não há usuário, para de carregar pois não haverá dados
        setLoading(false);
    }
  }, [user, authLoading]);

  // Mostra um esqueleto de carregamento enquanto a autenticação ou a busca de dados estão em andamento.
  if (loading || authLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  return (
    <>
      <OrdersPageContent 
        initialOrders={orders} 
      />
    </>
  );
}
