/**
 * @fileoverview Página de diagnóstico do cliente.
 * 
 * Responsabilidades:
 * - Receber o ID do cliente pela URL.
 * - Buscar e exibir as informações detalhadas do cliente.
 * - Buscar e listar todos os orçamentos e pedidos associados a esse cliente.
 * - Apresentar os dados de forma clara em seções distintas.
 * - Lidar com estados de carregamento e casos onde o cliente não é encontrado.
 */

'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/auth-provider';
import type { Client, Order, Orcamento } from '@/types';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User, ClipboardList, Package } from 'lucide-react';
import { notFound } from 'next/navigation';

interface DiagnosticoData {
    client: Client;
    orders: Order[];
    orcamentos: Orcamento[];
}

const orderStatusVariantMap: { [key in Order['status']]: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' } = {
  'Processando': 'default',
  'Enviado': 'secondary',
  'Entregue': 'success',
  'Cancelado': 'destructive',
  'Exceção': 'outline',
  'Faturado': 'success',
};

const orcamentoStatusVariantMap: { [key in Orcamento['status']]: 'warning' | 'success' | 'destructive' } = {
  'Pendente': 'warning',
  'Aprovado': 'success',
  'Rejeitado': 'destructive',
};


export default function ClienteDiagnosticoPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DiagnosticoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = params;

  useEffect(() => {
    if (!authLoading && user && id) {
      const getDiagnosticoData = async () => {
        try {
          // 1. Fetch Client Details
          const clientRef = doc(db, 'clients', id);
          const clientSnap = await getDoc(clientRef);

          if (!clientSnap.exists()) {
            setError('Cliente não encontrado.');
            return notFound();
          }
          const clientData = { id: clientSnap.id, ...clientSnap.data() } as Client;

          // 2. Fetch Orders for this Client
          const ordersQuery = query(collection(db, 'orders'), where('customer.email', '==', clientData.email));
          
          // 3. Fetch Quotes for this Client
          const orcamentosQuery = query(collection(db, 'orcamentos'), where('clientId', '==', id));

          const [ordersSnapshot, orcamentosSnapshot] = await Promise.all([
            getDocs(ordersQuery),
            getDocs(orcamentosQuery)
          ]);

          const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
          const orcamentos = orcamentosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Orcamento));

          setData({ client: clientData, orders, orcamentos });

        } catch (e: any) {
          console.error("Failed to fetch client diagnosis data", e);
          setError("Ocorreu um erro ao buscar os dados do cliente.");
        } finally {
          setLoading(false);
        }
      };

      getDiagnosticoData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading, id]);

  if (loading || authLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  if (error) {
     return (
       <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-96">
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              Erro ao Carregar Dados
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {error}
            </p>
          </div>
        </div>
    )
  }

  if (!data) {
    return null; // or a 'not found' component
  }

  const { client, orders, orcamentos } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Diagnóstico de Cliente: ${client.name}`}
        description={`Visão completa do histórico de ${client.email}`}
      />
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
            <User className="w-8 h-8 text-muted-foreground" />
            <div>
                <CardTitle>Informações do Cliente</CardTitle>
                <CardDescription>Detalhes de contato e cadastro.</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
                <p className="font-semibold text-primary">{client.name}</p>
                <p className="text-muted-foreground">{client.email}</p>
            </div>
             <div>
                <p className="font-semibold">Telefone</p>
                <p className="text-muted-foreground">{client.phone || 'Não informado'}</p>
            </div>
             <div>
                <p className="font-semibold">Cliente desde</p>
                <p className="text-muted-foreground">{new Date(client.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
        </CardContent>
      </Card>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                 <ClipboardList className="w-8 h-8 text-muted-foreground" />
                 <div>
                    <CardTitle>Orçamentos ({orcamentos.length})</CardTitle>
                    <CardDescription>Histórico de todos os orçamentos.</CardDescription>
                 </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orcamentos.length > 0 ? orcamentos.map(o => (
                            <TableRow key={o.id}>
                                <TableCell className="font-mono text-xs">{o.id.substring(0,7)}...</TableCell>
                                <TableCell><Badge variant={orcamentoStatusVariantMap[o.status]}>{o.status}</Badge></TableCell>
                                <TableCell className="text-right">R$ {o.price.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">Nenhum orçamento encontrado.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                 <Package className="w-8 h-8 text-muted-foreground" />
                 <div>
                    <CardTitle>Pedidos ({orders.length})</CardTitle>
                    <CardDescription>Histórico de todos os pedidos.</CardDescription>
                 </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {orders.length > 0 ? orders.map(p => (
                            <TableRow key={p.id}>
                                <TableCell className="font-mono text-xs">{p.id.substring(0,7)}...</TableCell>
                                <TableCell><Badge variant={orderStatusVariantMap[p.status]}>{p.status}</Badge></TableCell>
                                <TableCell className="text-right">R$ {p.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">Nenhum pedido encontrado.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
