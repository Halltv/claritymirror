/**
 * @fileoverview Página de Orçamentos, responsável por buscar os dados iniciais do servidor.
 *
 * Responsabilidades:
 * - Atua como um Server Component para buscar os dados no lado do servidor.
 * - Espera a confirmação de autenticação do usuário usando o hook `useAuth`.
 * - Busca a lista inicial de orçamentos e os IDs de orçamentos já vinculados a pedidos.
 * - Exibe um estado de carregamento (`Skeleton`) enquanto os dados são buscados.
 * - Passa os dados para o componente de cliente `OrcamentosContent` para renderização e interatividade.
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
          // Busca todos os orçamentos, ordenados pelos mais recentes.
          const orcamentosQuery = query(collection(db, 'orcamentos'), orderBy('createdAt', 'desc'));
          // Busca todos os pedidos que têm um orcamentoId, para saber quais orçamentos já geraram um pedido.
          const ordersQuery = query(collection(db, 'orders'), where('orcamentoId', '!=', null));

          const [orcamentosSnapshot, ordersSnapshot] = await Promise.all([
            getDocs(orcamentosQuery),
            getDocs(ordersQuery),
          ]);

          const orcamentos = orcamentosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Orcamento));
          
          // Cria um conjunto de IDs de orçamentos que já foram convertidos em pedidos.
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
