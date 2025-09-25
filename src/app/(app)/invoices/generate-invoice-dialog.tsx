
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { collection, getDocs, query, where, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Order, Invoice } from '@/types';

const invoiceSchema = z.object({
  orderId: z.string({ required_error: 'Selecione um pedido para faturar.' }).min(1, 'Selecione um pedido para faturar.'),
  invoiceNumber: z.string().min(1, 'O número da nota fiscal é obrigatório.'),
  accessKey: z.string().length(44, 'A chave de acesso deve ter 44 caracteres.').optional().or(z.literal('')),
  issueDate: z.date({ required_error: 'A data de emissão é obrigatória.' }),
  amount: z.coerce.number().min(0.01, 'O valor deve ser maior que zero.'),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface GenerateInvoiceDialogProps {
  orderId?: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  trigger?: React.ReactNode;
  onInvoiceGenerated: (invoice: Invoice) => void;
}

export function GenerateInvoiceDialog({
  orderId,
  onOpenChange,
  open,
  trigger,
  onInvoiceGenerated,
}: GenerateInvoiceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      orderId: '',
      invoiceNumber: '',
      accessKey: '',
      issueDate: new Date(),
      amount: 0,
    }
  });

  const selectedOrderId = form.watch('orderId');

  // Fetch pending orders when dialog opens
  useEffect(() => {
    const dialogIsOpen = open ?? internalOpen;
    if (dialogIsOpen) {
      const fetchOrders = async () => {
        try {
          const q = query(collection(db, 'orders'), where('status', 'not-in', ['Cancelado']));
          const querySnapshot = await getDocs(q);
          const pendingOrdersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
          setOrders(pendingOrdersData);

          // If an orderId is passed as a prop, pre-select it.
          if(orderId) {
             // We might need to fetch the specific order if it's not in the pending list
             const orderToSelect = pendingOrdersData.find(o => o.id === orderId);
             if (orderToSelect) {
                form.setValue('orderId', orderToSelect.id, { shouldValidate: true });
                form.setValue('amount', orderToSelect.outstanding, { shouldValidate: true });
             }
          }
        } catch (e) {
          console.error("Failed to fetch pending orders", e);
          toast({ title: 'Erro ao buscar pedidos', variant: 'destructive' });
        }
      };
      fetchOrders();
    }
  }, [open, internalOpen, orderId, form, toast]);


  // Effect to update amount when order is selected manually in the dropdown
  useEffect(() => {
    if (selectedOrderId) {
      const selectedOrder = orders.find(o => o.id === selectedOrderId);
      if (selectedOrder) {
        // Se o pedido já foi faturado internamente (outstanding 0), preenche o valor com o total do pedido.
        // Caso contrário, usa o valor pendente.
        const amountToSet = selectedOrder.outstanding > 0 ? selectedOrder.outstanding : selectedOrder.amount;
        form.setValue('amount', amountToSet, { shouldValidate: true });
      }
    }
  }, [selectedOrderId, orders, form]);


  async function onSubmit(data: InvoiceFormValues) {
    try {
      // 1. Check if invoice number already exists
      const invoiceNumberQuery = query(collection(db, "invoices"), where("invoiceNumber", "==", data.invoiceNumber.trim()));
      const invoiceNumberSnapshot = await getDocs(invoiceNumberQuery);
      if (!invoiceNumberSnapshot.empty) {
          toast({
              title: 'Erro de Duplicidade',
              description: 'Este número de nota fiscal já foi registrado no sistema.',
              variant: 'destructive',
          });
          return;
      }

      // 2. Check if access key already exists (if provided)
      if (data.accessKey && data.accessKey.trim().length === 44) {
         const accessKeyQuery = query(collection(db, "invoices"), where("accessKey", "==", data.accessKey.trim()));
         const accessKeySnapshot = await getDocs(accessKeyQuery);
         if (!accessKeySnapshot.empty) {
          toast({
              title: 'Erro de Duplicidade',
              description: 'Esta chave de acesso já foi registrada no sistema.',
              variant: 'destructive',
          });
          return;
        }
      }

    } catch (e) {
        console.error("Error checking for duplicate invoice data: ", e);
        toast({ title: 'Erro ao verificar dados da nota fiscal', variant: 'destructive' });
        return;
    }


    const selectedOrder = orders.find(o => o.id === data.orderId);
    if (!selectedOrder) {
        toast({ title: 'Pedido não encontrado', description: 'O pedido selecionado não foi encontrado.', variant: 'destructive' });
        return;
    }
    
    const newInvoiceData: Omit<Invoice, 'id' | 'createdAt'> = {
      invoiceNumber: data.invoiceNumber.trim(),
      accessKey: data.accessKey?.trim(),
      orderId: data.orderId,
      customerName: selectedOrder.customer.name,
      date: data.issueDate.toISOString(),
      status: 'Paga', // Invoice is created as Paid by default
      total: data.amount,
    };
    
    try {
      // 3. Add new invoice to Firestore
      const createdAt = new Date().toISOString();
      const docRef = await addDoc(collection(db, 'invoices'), { ...newInvoiceData, createdAt });
      const newInvoice: Invoice = { id: docRef.id, ...newInvoiceData, createdAt };

      // 4. Update order outstanding amount and status
      const orderRef = doc(db, 'orders', data.orderId);
      const newOutstanding = selectedOrder.outstanding - data.amount;
      await updateDoc(orderRef, {
        outstanding: Math.max(0, newOutstanding),
        status: newOutstanding <= 0 ? 'Faturado' : selectedOrder.status,
      });

      if(onInvoiceGenerated) {
        onInvoiceGenerated(newInvoice);
      }

      toast({
        title: 'NF-e Registrada com Sucesso!',
        description: `A nota fiscal ${newInvoice.invoiceNumber} foi registrada no sistema.`,
      });
      
      handleOpenChange(false);
      form.reset();

    } catch (e) {
      console.error("Error creating invoice: ", e);
      toast({ title: 'Erro ao registrar NF-e', variant: 'destructive' });
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    } else {
      setInternalOpen(isOpen);
    }
    if (!isOpen) {
      form.reset({ 
        orderId: '',
        invoiceNumber: '',
        accessKey: '',
        issueDate: new Date(),
        amount: 0 
      });
    }
  };

  const dialogState = open ?? internalOpen;
  const isFormValid = form.formState.isValid;

  return (
    <Dialog open={dialogState} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Nota Fiscal (NF-e)</DialogTitle>
          <DialogDescription>
            Insira os dados da nota fiscal emitida para este pedido.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pedido do Cliente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!!orderId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um pedido para faturar..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orders.map(order => (
                          <SelectItem key={order.id} value={order.id}>
                            {order.customer.name} - Pedido {order.id.substring(0,7)}... (R$ {order.outstanding.toFixed(2)})
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número da Nota Fiscal</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accessKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave de Acesso (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Chave de 44 dígitos da NF-e" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da Nota (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Emissão</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP', { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={!isFormValid || form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Registrando...' : 'Registrar Nota Fiscal'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    

    

    

    