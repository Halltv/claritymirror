/**
 * @fileoverview Página de Orçamentos, agora como um componente de cliente para lidar com regras de segurança.
 *
 * Responsabilidades:
 * - Esperar a confirmação de autenticação do usuário usando o hook `useAuth`.
 * - Buscar a lista inicial de orçamentos e os IDs de pedidos vinculados somente após o usuário ser autenticado.
 * - Exibir um estado de carregamento enquanto os dados são buscados.
 * - Passar os dados para o componente `OrcamentosContent` para renderização.
 */
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Orcamento, Order } from '@/types';
import { OrcamentosContent } from './orcamentos-content';
import { useAuth } from '@/components/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrcamentosPage() {
  const { user, loading: authLoading } = useAuth();
  const [orcamentosData, setOrcamentosData] = useState<{ orcamentos: Orcamento[], linkedIds: string[] }>({ orcamentos: [], linkedIds: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      const getOrcamentosData = async () => {
        try {
          const orcamentosQuery = query(collection(db, 'orcamentos'), orderBy('createdAt', 'desc'));
          const ordersQuery = query(collection(db, 'orders'), where('orcamentoId', '!=', null));

          const [orcamentosSnapshot, ordersSnapshot] = await Promise.all([
            getDocs(orcamentosQuery),
            getDocs(ordersQuery),
          ]);

          const orcamentos = orcamentosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Orcamento));
          
          const linkedOrcamentoIds = new Set<string>();
          ordersSnapshot.forEach(doc => {
            const order = doc.data() as Order;
            if (order.orcamentoId) {
              linkedOrcamentoIds.add(order.orcamentoId);
            }
          });
          
          setOrcamentosData({ orcamentos, linkedIds: Array.from(linkedOrcamentoIds) });
        } catch (err) {
          console.error("Failed to fetch orcamentos data:", err);
        } finally {
          setLoading(false);
        }
      };
      
      getOrcamentosData();

    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  return (
    <OrcamentosContent 
      initialOrcamentos={orcamentosData.orcamentos} 
      orderLinkedOrcamentoIds={orcamentosData.linkedIds} 
    />
  );
}
