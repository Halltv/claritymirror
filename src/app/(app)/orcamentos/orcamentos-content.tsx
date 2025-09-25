

/**
 * @fileoverview Componente de cliente que gerencia o estado e a interatividade da página de Orçamentos.
 *
 * Responsabilidades:
 * - Receber a lista inicial de orçamentos e mantê-la no estado.
 * - Renderizar a tabela de orçamentos ou um estado vazio se não houver nenhum.
 * - Gerenciar a abertura e o estado do diálogo `NovoOrcamentoDialog` para criar novos orçamentos.
 * - Implementar as ações do menu de cada orçamento:
 *   - Atualizar o status de um orçamento (Aprovar/Rejeitar).
 *   - Gerar um novo pedido no Firestore a partir de um orçamento aprovado.
 * - Atualizar o estado local para refletir as mudanças na UI em tempo real.
 * - Exibir toasts de feedback para o usuário.
 */

'use client';

import { useState } from 'react';
import { collection, doc, updateDoc, addDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NovoOrcamentoDialog } from './novo-orcamento-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileText, Loader2, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Orcamento, Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/page-header';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { OrcamentoPdfLayout } from './orcamento-pdf-layout';


const statusVariantMap: { [key in Orcamento['status']]: 'warning' | 'success' | 'destructive' } = {
  'Pendente': 'warning',
  'Aprovado': 'success',
  'Rejeitado': 'destructive',
};

interface OrcamentosContentProps {
    initialOrcamentos: Orcamento[];
    orderLinkedOrcamentoIds: string[];
}

export function OrcamentosContent({ initialOrcamentos, orderLinkedOrcamentoIds }: OrcamentosContentProps) {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(initialOrcamentos || []);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const { toast } = useToast();
  // Mantém um conjunto de IDs de orçamentos que já geraram um pedido.
  const [linkedIds, setLinkedIds] = useState(new Set(orderLinkedOrcamentoIds));

  const handleOrcamentoCriado = (novoOrcamento: Orcamento) => {
    setOrcamentos(prev => [novoOrcamento, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  /**
   * Atualiza o status de um orçamento no Firestore e no estado local.
   * @param id O ID do orçamento a ser atualizado.
   * @param status O novo status do orçamento.
   */
  const handleUpdateStatus = async (id: string, status: Orcamento['status']) => {
    try {
      const orcamentoRef = doc(db, 'orcamentos', id);
      await updateDoc(orcamentoRef, { status });
      
      setOrcamentos(prev => prev.map(o => o.id === id ? { ...o, status } : o));

      toast({ title: "Status do orçamento atualizado!" });
    } catch(e) {
      console.error("Error updating status: ", e);
      toast({ title: "Erro ao atualizar status", variant: 'destructive' });
    }
  };

  /**
   * Cria um novo pedido no Firestore a partir de um orçamento aprovado.
   * @param orcamento O orçamento que servirá de base para o novo pedido.
   */
  const handleGenerateOrder = async (orcamento: Orcamento) => {
    // 1. Verifica se já existe um pedido para este orçamento no banco de dados.
    const ordersQuery = query(collection(db, "orders"), where("orcamentoId", "==", orcamento.id));
    const querySnapshot = await getDocs(ordersQuery);
    
    if (!querySnapshot.empty) {
      toast({
        title: "Pedido já existe",
        description: "Este orçamento já foi usado para gerar um pedido.",
        variant: "destructive",
      });
      // Adiciona ao set de IDs vinculados para garantir que a UI seja atualizada.
      setLinkedIds(prev => new Set(prev).add(orcamento.id));
      return;
    }


    const newOrderData: Omit<Order, 'id'> = {
      orcamentoId: orcamento.id,
      customer: {
        name: orcamento.clientName,
        email: orcamento.clientEmail,
      },
      date: new Date().toISOString(),
      amount: orcamento.price,
      status: 'Processando',
      outstanding: orcamento.price,
      createdAt: new Date().toISOString(),
    };

    try {
      // Usar um batch para garantir atomicidade
      const batch = writeBatch(db);

      // 2. Cria um novo pedido no Firestore.
      const newOrderRef = doc(collection(db, 'orders'));
      batch.set(newOrderRef, newOrderData);
      
      // 3. Atualiza o status do orçamento para 'Aprovado' se ainda não estiver.
      if (orcamento.status !== 'Aprovado') {
        const orcamentoRef = doc(db, 'orcamentos', orcamento.id);
        batch.update(orcamentoRef, { status: 'Aprovado' });
      }

      await batch.commit();

      // 4. Atualiza o estado local
      setOrcamentos(prev => prev.map(o => o.id === orcamento.id ? { ...o, status: 'Aprovado' } : o));
      setLinkedIds(prev => new Set(prev).add(orcamento.id));

      toast({
        title: "Pedido Gerado com Sucesso!",
        description: `O pedido ${newOrderRef.id.substring(0,7)} foi criado a partir do orçamento.`,
      });
    } catch (e) {
      console.error("Error generating order: ", e);
      toast({ title: "Erro ao gerar pedido", variant: 'destructive' });
    }
  };
  
  const handleViewPdf = async (orcamento: Orcamento) => {
    setGeneratingPdf(orcamento.id);
    const pdfElement = document.getElementById(`pdf-layout-${orcamento.id}`);
    
    if (!pdfElement) {
      toast({ title: "Erro ao gerar PDF", description: "Layout do PDF não encontrado.", variant: 'destructive' });
      setGeneratingPdf(null);
      return;
    }

    try {
      const canvas = await html2canvas(pdfElement, {
        scale: 2, // Aumenta a resolução da imagem
        useCORS: true, 
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const height = pdfWidth / ratio;
      
      // Se a altura for maior que a página, precisaremos de múltiplas páginas (não implementado ainda)
      // Por agora, vamos ajustar a imagem à página
      const finalHeight = height > pdfHeight ? pdfHeight : height;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalHeight);
      pdf.save(`orcamento-${orcamento.id.substring(0, 7)}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: "Erro ao gerar PDF", description: "Houve um problema ao criar o arquivo.", variant: 'destructive' });
    } finally {
      setGeneratingPdf(null);
    }
  };


  return (
    <>
      <PageHeader
        title="Orçamentos"
        description="Crie e gerencie os orçamentos para seus clientes."
      >
        <NovoOrcamentoDialog onOrcamentoCriado={handleOrcamentoCriado} />
      </PageHeader>
      
      {/* Elementos ocultos para renderização do PDF */}
      <div className="absolute top-0 left-0 w-[800px] -z-10 opacity-0" aria-hidden>
        {orcamentos.map(orcamento => (
          <div key={`pdf-${orcamento.id}`} id={`pdf-layout-${orcamento.id}`}>
            <OrcamentoPdfLayout orcamento={orcamento} />
          </div>
        ))}
      </div>


      {orcamentos.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-96">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              Você ainda não tem nenhum orçamento
            </h3>
            <p className="text-sm text-muted-foreground">
              Clique no botão abaixo para criar seu primeiro orçamento.
            </p>
            <div className="mt-4">
              <NovoOrcamentoDialog onOrcamentoCriado={handleOrcamentoCriado} isTrigger />
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Orçamentos</CardTitle>
            <CardDescription>
              Aqui está a lista de todos os orçamentos criados.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orçamento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Data de Entrega</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[60px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orcamentos.map((orcamento) => {
                  const hasOrder = linkedIds.has(orcamento.id);
                  return (
                  <TableRow key={orcamento.id}>
                    <TableCell className="font-medium">{orcamento.id.substring(0, 7)}...</TableCell>
                    <TableCell>{orcamento.clientName}</TableCell>
                    <TableCell className="capitalize">{orcamento.model.replace('-', ' ')}</TableCell>
                    <TableCell>{new Date(orcamento.deliveryDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariantMap[orcamento.status]}>{orcamento.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {orcamento.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={generatingPdf === orcamento.id}>
                             {generatingPdf === orcamento.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                             ) : (
                                <MoreHorizontal className="h-4 w-4" />
                             )}
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                           <DropdownMenuItem onClick={() => handleViewPdf(orcamento)} disabled={generatingPdf === orcamento.id}>
                            <FileText className="mr-2 h-4 w-4" />
                            Visualizar PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(orcamento.id)}>
                            Copiar ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {orcamento.status === 'Pendente' && (
                             <>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(orcamento.id, 'Aprovado')}>
                                <Check className="mr-2 h-4 w-4" />
                                Aprovar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(orcamento.id, 'Rejeitado')}>
                                <X className="mr-2 h-4 w-4" />
                                Rejeitar
                              </DropdownMenuItem>
                            </>
                          )}
                          {/* Só mostra "Gerar Pedido" se o status for Aprovado E não houver pedido vinculado */}
                          {orcamento.status === 'Aprovado' && !hasOrder && (
                             <DropdownMenuItem onClick={() => handleGenerateOrder(orcamento)}>
                              Gerar Pedido
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
