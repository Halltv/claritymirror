
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Orcamento, Client } from '@/types';
import { MirrorModelPreview } from '@/components/mirror-model-preview';

const orcamentoSchema = z.object({
  clientId: z.string(), // Can be 'new' or an existing client ID
  clientName: z.string().min(1, 'O nome do cliente é obrigatório.'),
  clientEmail: z.string().email('Insira um email válido.'),
  clientPhone: z.string().optional(),
  architect: z.string().optional(),
  environment: z.string().min(1, 'O ambiente é obrigatório.'),
  model: z.string({ required_error: 'Selecione um modelo.' }),
  width: z.coerce.number().min(1, 'A largura deve ser maior que 0.'),
  height: z.coerce.number().min(1, 'A altura deve ser maior que 0.'),
  ledTemp: z.string({ required_error: 'Selecione a temperatura do LED.' }),
  features: z.string().optional(),
  price: z.coerce.number().min(0.01, 'O valor deve ser maior que zero.'),
  deliveryDate: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
    message: 'Data de entrega inválida.',
  }),
});

type OrcamentoFormValues = z.infer<typeof orcamentoSchema>;

interface NovoOrcamentoDialogProps {
  onOrcamentoCriado: (orcamento: Orcamento) => void;
  isTrigger?: boolean;
}

export function NovoOrcamentoDialog({ onOrcamentoCriado, isTrigger = false }: NovoOrcamentoDialogProps) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const { toast } = useToast();

  const form = useForm<OrcamentoFormValues>({
    resolver: zodResolver(orcamentoSchema),
    defaultValues: {
      clientId: 'new',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      architect: '',
      environment: '',
      model: '',
      width: 0,
      height: 0,
      ledTemp: '',
      features: 'none',
      price: 0,
      deliveryDate: new Date().toISOString().split('T')[0],
    }
  });

  const selectedClientId = form.watch('clientId');
  const selectedModel = form.watch('model');

  // Fetch clients when dialog opens
  useEffect(() => {
    if (open) {
      const fetchClients = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "clients"));
          const clientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
          setClients(clientsData.sort((a,b) => a.name.localeCompare(b.name)));
        } catch (error) {
          console.error("Error fetching clients: ", error);
          toast({
            title: "Erro ao buscar clientes",
            description: "Não foi possível carregar a lista de clientes.",
            variant: "destructive",
          });
        }
      };
      fetchClients();
    }
  }, [open, toast]);

  // Update form fields when a client is selected
  useEffect(() => {
    if (selectedClientId && selectedClientId !== 'new') {
      const selectedClient = clients.find(c => c.id === selectedClientId);
      if (selectedClient) {
        form.setValue('clientName', selectedClient.name);
        form.setValue('clientEmail', selectedClient.email);
        form.setValue('clientPhone', selectedClient.phone || '');
      }
    } else if (selectedClientId === 'new') {
        form.setValue('clientName', '');
        form.setValue('clientEmail', '');
        form.setValue('clientPhone', '');
    }
  }, [selectedClientId, clients, form]);

  async function onSubmit(data: OrcamentoFormValues) {
    let finalClientId = data.clientId;
    let finalClientName = data.clientName;

    // If it's a new client, create it first
    if (data.clientId === 'new') {
      try {
        const q = query(collection(db, "clients"), where("email", "==", data.clientEmail));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const existingClientDoc = querySnapshot.docs[0];
            finalClientId = existingClientDoc.id;
            finalClientName = existingClientDoc.data().name;
             toast({
                title: "Cliente já existente",
                description: `Um cliente com este email já existe. O orçamento será associado a ${finalClientName}.`,
             });
        } else {
            const createdAt = new Date().toISOString();
            const newClientData = { 
                name: data.clientName, 
                email: data.clientEmail, 
                phone: data.clientPhone || '',
                company: '', 
                createdAt 
            };
            const docRef = await addDoc(collection(db, "clients"), newClientData);
            finalClientId = docRef.id;
            window.dispatchEvent(new CustomEvent('client-added', { detail: { id: docRef.id, ...newClientData }}));
            toast({
                title: "Novo Cliente Criado!",
                description: `${data.clientName} foi adicionado à sua base de clientes.`,
            });
        }
      } catch (error) {
        console.error("Error creating new client: ", error);
        toast({ title: "Erro ao criar cliente", variant: "destructive" });
        return;
      }
    }

    const orcamentoData: Omit<Orcamento, 'id'> = {
      clientId: finalClientId,
      clientName: finalClientName,
      clientEmail: data.clientEmail,
      architect: data.architect,
      environment: data.environment,
      model: data.model,
      width: data.width,
      height: data.height,
      ledTemp: data.ledTemp,
      features: data.features,
      price: data.price,
      deliveryDate: data.deliveryDate,
      status: 'Pendente',
      createdAt: new Date().toISOString(),
    };
    
    try {
        const docRef = await addDoc(collection(db, 'orcamentos'), orcamentoData);
        const novoOrcamento: Orcamento = {
            id: docRef.id,
            ...orcamentoData
        };
        onOrcamentoCriado(novoOrcamento);
        toast({
            title: 'Orçamento Criado!',
            description: `O orçamento para ${finalClientName} foi salvo com sucesso.`,
        });
        setOpen(false);
        form.reset();
    } catch (e) {
        console.error("Error adding orcamento: ", e);
        toast({ title: "Erro ao criar orçamento", variant: 'destructive' });
    }
  }

  const triggerButton = (
    <Button size={isTrigger ? 'default' : 'sm'} className="gap-1">
      <PlusCircle className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
        Novo Orçamento
      </span>
    </Button>
  );

  const isNewClient = selectedClientId === 'new';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Orçamento</DialogTitle>
          <DialogDescription>
            Selecione um cliente existente ou adicione um novo para gerar um orçamento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto p-1">
            <div className="space-y-4 p-4 rounded-md border">
                <h4 className="font-semibold">1. Informações do Cliente</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue="new" value={field.value}>
                           <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecione um cliente..." /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new">-- Adicionar Novo Cliente --</SelectItem>
                            <Separator />
                            {clients.map(client => (
                              <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {isNewClient && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Novo Cliente</FormLabel>
                          <FormControl><Input placeholder="Ex: João da Silva" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clientEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email do Novo Cliente</FormLabel>
                          <FormControl><Input type="email" placeholder="Ex: joao.silva@email.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clientPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone (Opcional)</FormLabel>
                          <FormControl><Input placeholder="(11) 99999-9999" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="architect"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arquiteto/Parceiro (Opcional)</FormLabel>
                        <FormControl><Input placeholder="Ex: Ana Costa" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="environment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ambiente</FormLabel>
                        <FormControl><Input placeholder="Ex: Banheiro Suíte" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="space-y-4 p-4 rounded-md border h-full flex flex-col">
                <h4 className="font-semibold">2. Detalhes do Espelho</h4>
                <div className="grid grid-cols-1 gap-4 items-end flex-1">
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="retangular">Retangular</SelectItem>
                            <SelectItem value="quadrado">Quadrado</SelectItem>
                            <SelectItem value="redondo">Redondo</SelectItem>
                            <SelectItem value="oval-puro">Oval "Puro"</SelectItem>
                            <SelectItem value="oval-reto">Oval com Parte Reta</SelectItem>
                            <SelectItem value="oval-duas-pontas">Duas Pontas Redondas</SelectItem>
                            <SelectItem value="organico-1">Orgânico Modelo 1</SelectItem>
                            <SelectItem value="organico-2">Orgânico Modelo 2</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Largura (cm)</FormLabel>
                        <FormControl><Input type="number" placeholder="80" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Altura (cm)</FormLabel>
                        <FormControl><Input type="number" placeholder="120" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                </div>
              </div>
               <div className="space-y-4 p-4 rounded-md border bg-muted/30 h-full">
                  <h4 className="font-semibold">Pré-visualização</h4>
                  <div className="flex items-center justify-center min-h-[150px]">
                      <MirrorModelPreview model={selectedModel as any} className="w-40 h-40 text-muted-foreground" />
                  </div>
              </div>
            </div>

             <div className="space-y-4 p-4 rounded-md border">
              <h4 className="font-semibold">3. Acabamento e Funcionalidades</h4>
              <div className="grid md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="ledTemp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura do LED</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="3000k">Branco Quente (3000K)</SelectItem>
                            <SelectItem value="4000k">Branco Neutro (4000K)</SelectItem>
                            <SelectItem value="6000k">Branco Frio (6000K)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recursos Adicionais</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="anti-fog">Anti-embaçante</SelectItem>
                          <SelectItem value="bluetooth">Bluetooth com Alto-falante</SelectItem>
                          <SelectItem value="relogio">Relógio Digital</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>


            <div className="space-y-4 p-4 rounded-md border">
              <h4 className="font-semibold">4. Financeiro e Prazos</h4>
               <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Orçamento (R$)</FormLabel>
                      <FormControl><Input type="number" step="0.01" placeholder="1250.00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Prevista de Entrega</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-background py-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Orçamento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
