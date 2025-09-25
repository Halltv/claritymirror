/**
 * @fileoverview Componente de cliente que gerencia o estado e a interatividade da página de Clientes.
 * 
 * Responsabilidades:
 * - Receber a lista inicial de clientes do componente de servidor.
 * - Manter o estado da lista de clientes (`clients`).
 * - Fornecer a funcionalidade para adicionar um novo cliente ao Firestore através do `NovoClienteDialog`.
 * - Atualizar a UI em tempo real quando um novo cliente é adicionado.
 * - Exibir notificações (toasts) para feedback do usuário (sucesso ou erro).
 * - Ouvir um evento customizado `client-added` para atualizar a lista de clientes quando um cliente é adicionado de outra parte da aplicação (ex: tela de Orçamentos).
 */

'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Client } from '@/types';
import { ClientList } from './client-list';
import { NovoClienteDialog } from './novo-cliente-dialog';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/page-header';

interface ClientPageContentProps {
    initialClients: Client[];
}

export function ClientPageContent({ initialClients }: ClientPageContentProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const { toast } = useToast();

  // Escuta por um evento customizado para atualizar a lista de clientes
  // a partir de outras partes da aplicação (ex: quando um cliente é criado na tela de Orçamentos).
  useEffect(() => {
    const handleClientAddedFromOrcamento = (event: Event) => {
        const customEvent = event as CustomEvent;
        const newClient = customEvent.detail as Client;
        if (newClient && !clients.some(c => c.id === newClient.id)) {
            setClients(prevClients => [...prevClients, newClient].sort((a, b) => a.name.localeCompare(b.name)));
        }
    };
    window.addEventListener('client-added', handleClientAddedFromOrcamento);
    return () => window.removeEventListener('client-added', handleClientAddedFromOrcamento);
  }, [clients]);

  /**
   * Manipulador para adicionar um novo cliente.
   * Persiste o novo cliente no Firestore e atualiza o estado local.
   * @param newClientData - Os dados do novo cliente vindos do formulário.
   */
  const handleClientAdded = async (newClientData: Omit<Client, 'id' | 'createdAt'>) => {
     try {
      const createdAt = new Date().toISOString();
      const docRef = await addDoc(collection(db, "clients"), {
        ...newClientData,
        createdAt,
      });
      const newClient: Client = { 
        id: docRef.id, 
        ...newClientData, 
        createdAt 
      };
      setClients(prevClients => [...prevClients, newClient].sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: "Cliente Adicionado!",
        description: "O novo cliente foi salvo com sucesso no banco de dados.",
      });
    } catch (error) {
      console.error("Error adding client: ", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível adicionar o novo cliente.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      <PageHeader title="Clientes" description="Gerencie sua base de clientes.">
        <NovoClienteDialog onClientAdded={handleClientAdded} />
      </PageHeader>
      <ClientList initialClients={clients} />
    </>
  );
}
