/**
 * @fileoverview Página de Faturas (NF-e), agora como um componente de cliente para lidar com regras de segurança.
 *
 * Responsabilidades:
 * - Esperar a confirmação de autenticação do usuário usando o hook `useAuth`.
 * - Buscar a lista de faturas somente após o usuário ser autenticado.
 * - Exibir um estado de carregamento enquanto os dados são buscados.
 * - Passar os dados para o componente `InvoicesContent` para renderização.
 */
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Invoice } from '@/types';
import { InvoicesContent } from './invoices-content';
import { useAuth } from '@/components/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';

export default function InvoicesPage() {
  const { user, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      const getInvoices = async () => {
        try {
          const q = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
          const querySnapshot = await getDocs(q);
          const invoicesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
          setInvoices(invoicesData);
        } catch (error) {
          console.error('Failed to fetch invoices from firestore', error);
        } finally {
          setLoading(false);
        }
      };
      
      getInvoices();

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
    <>
      <InvoicesContent initialInvoices={invoices} />
    </>
  );
}
