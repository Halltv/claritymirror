/**
 * @fileoverview Página de Clientes, agora como um componente de cliente para lidar com regras de segurança.
 *
 * Responsabilidades:
 * - Esperar a confirmação de autenticação do usuário usando o hook `useAuth`.
 * - Buscar a lista de clientes somente após o usuário ser autenticado.
 * - Exibir um estado de carregamento enquanto os dados são buscados.
 * - Passar os dados para o componente `ClientPageContent` para renderização.
 */
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Client } from '@/types';
import { ClientPageContent } from './client-page-content';
import { useAuth } from '@/components/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClientesPage() {
  const { user, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      const getClients = async () => {
        try {
          const q = query(collection(db, 'clients'), orderBy('name', 'asc'));
          const querySnapshot = await getDocs(q);
          const clientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
          setClients(clientsData);
        } catch (error) {
          console.error("Failed to fetch clients from firestore", error);
        } finally {
          setLoading(false);
        }
      };
      
      getClients();
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

  return <ClientPageContent initialClients={clients} />;
}
