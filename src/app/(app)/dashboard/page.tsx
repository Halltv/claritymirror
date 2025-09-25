/**
 * @fileoverview Página principal do Dashboard, agora dinâmica com dados do Firestore e ciente do estado de autenticação.
 * 
 * Responsabilidades:
 * - Como um componente de cliente, espera a confirmação do usuário logado.
 * - Busca dados das coleções 'orders', 'clients', e 'orcamentos' no Firestore somente após a autenticação.
 * - Exibe um estado de carregamento enquanto os dados são buscados.
 * - Calcula métricas chave dinamicamente: Receita Total, Orçamentos Pendentes, etc.
 * - Passa os dados para os componentes de visualização.
 */
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/auth-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ClipboardList,
  Users,
  DollarSign,
  Percent,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { OverviewChart } from "./overview-chart";
import { RecentOrders } from "./recent-orders";
import type { Order, Orcamento, Client } from '@/types';
import { subDays, getMonth, getYear } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      const getDashboardData = async () => {
        try {
          const thirtyDaysAgo = subDays(new Date(), 30);

          const ordersQuery = query(collection(db, 'orders'), orderBy('date', 'desc'));
          const orcamentosQuery = query(collection(db, 'orcamentos'));
          const clientsQuery = query(collection(db, 'clients'), where('createdAt', '>=', thirtyDaysAgo.toISOString()));

          const [ordersSnapshot, orcamentosSnapshot, clientsSnapshot] = await Promise.all([
            getDocs(ordersQuery),
            getDocs(orcamentosQuery),
            getDocs(clientsQuery),
          ]);

          const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
          const orcamentos = orcamentosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Orcamento));
          const newClientsCount = clientsSnapshot.size;

          const totalRevenue = orders
            .filter(order => order.status !== 'Cancelado')
            .reduce((sum, order) => sum + order.amount, 0);
          
          const pendingOrcamentos = orcamentos.filter(o => o.status === 'Pendente').length;
          
          const approvedOrcamentos = orcamentos.filter(o => o.status === 'Aprovado').length;
          const approvalRate = orcamentos.length > 0 ? (approvedOrcamentos / orcamentos.length) * 100 : 0;
          
          const monthlyData: { [key: string]: { orcamentos: number; pedidos: number } } = {};
          const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
          const currentYear = getYear(new Date());

          monthLabels.forEach((_, index) => {
            const monthKey = `${currentYear}-${index}`;
            monthlyData[monthKey] = { orcamentos: 0, pedidos: 0 };
          });

          orcamentos.forEach(orcamento => {
            const date = new Date(orcamento.createdAt);
            if (getYear(date) === currentYear) {
              const monthKey = `${currentYear}-${getMonth(date)}`;
              if(monthlyData[monthKey]) monthlyData[monthKey].orcamentos += orcamento.price;
            }
          });

          orders.forEach(order => {
            const date = new Date(order.date);
            if (getYear(date) === currentYear) {
              const monthKey = `${currentYear}-${getMonth(date)}`;
              if(monthlyData[monthKey]) monthlyData[monthKey].pedidos += order.amount;
            }
          });

          const chartData = Object.keys(monthlyData).map((key) => {
              const [_, monthIndex] = key.split('-');
              return { month: monthLabels[parseInt(monthIndex)], ...monthlyData[key] };
          }).slice(0, getMonth(new Date()) + 1);

          setData({
            totalRevenue,
            pendingOrcamentos,
            newClientsCount,
            approvalRate,
            recentOrders: orders.slice(0, 5),
            chartData,
          });
        } catch (error: any) {
          console.error("Error fetching dashboard data:", error);
          if (error.code === 'permission-denied') {
             setError("As regras de segurança do Firestore não permitem o acesso aos dados. Por favor, ajuste as regras no Console do Firebase.");
          } else {
             setError("Ocorreu um erro ao buscar os dados do painel.");
          }
        } finally {
          setLoading(false);
        }
      };
      
      getDashboardData();

    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Painel de Indicadores" description="Carregando seus indicadores de desempenho..." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
          <Skeleton className="lg:col-span-4 h-80" />
          <Skeleton className="lg:col-span-3 h-80" />
        </div>
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
     return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-96">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">Nenhum dado para exibir</h3>
            <p className="text-sm text-muted-foreground">Comece a adicionar orçamentos e pedidos.</p>
          </div>
        </div>
     )
  }

  return (
    <>
      <PageHeader
        title="Painel de Indicadores"
        description="Uma visão geral do desempenho financeiro da sua empresa."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total (Pedidos)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {data.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em todos os pedidos não cancelados.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos Pendentes</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.pendingOrcamentos}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação do cliente.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
             <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.approvalRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              De todos os orçamentos criados.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.newClientsCount}</div>
            <p className="text-xs text-muted-foreground">
              Nos últimos 30 dias.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Orçamentos vs. Pedidos (Este Ano)</CardTitle>
            <CardDescription>
              Acompanhe os valores de orçamentos criados vs. pedidos confirmados.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={data.chartData} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>
              Os últimos 5 pedidos criados no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrders orders={data.recentOrders} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

    