
/**
 * @fileoverview
 * Este arquivo centraliza todas as definições de tipos TypeScript customizados para a aplicação.
 * Manter os tipos em um único local ajuda a garantir consistência e facilita a manutenção.
 */

export * from './user';


/**
 * Representa um pedido feito na plataforma, originado de um orçamento aprovado.
 */
export type Order = {
  id: string; // ID único do pedido, gerado pelo Firestore.
  orcamentoId?: string; // ID do orçamento que originou este pedido (opcional).
  customer: {
    name: string; // Nome do cliente.
    email: string; // Email do cliente.
  };
  date: string; // Data de criação do pedido, no formato ISO string.
  amount: number; // Valor total do pedido.
  status: 'Processando' | 'Enviado' | 'Entregue' | 'Cancelado' | 'Exceção' | 'Faturado'; // Status atual do pedido.
  outstanding: number; // Valor pendente de faturamento para este pedido.
  createdAt?: string; // Timestamp de quando o pedido foi criado, no formato ISO string.
};

/**
 * Representa um cliente no banco de dados.
 */
export type Client = {
  id: string; // ID único do cliente, gerado pelo Firestore.
  name: string; // Nome do cliente.
  email: string; // Email do cliente.
  phone?: string; // Telefone do cliente (opcional).
  company?: string; // Nome da empresa do cliente (opcional).
  createdAt: string; // Data de cadastro, no formato ISO string.
};

/**
 * Representa uma transação individual em um extrato bancário.
 */
export type BankTransaction = {
  id: string; // ID único da transação.
  date: string; // Data da transação, no formato ISO string.
  description: string; // Descrição da transação (ex: "Pagamento de fornecedor").
  amount: number; // Valor da transação (positivo para entradas, negativo para saídas).
};

/**
 * Representa um registro financeiro interno da empresa (ex: uma fatura emitida, um pagamento recebido).
 */
export type InternalRecord = {
  id: string; // ID único do registro.
  date: string; // Data do registro, no formato ISO string.
  description: string; // Descrição do registro.
  amount: number; // Valor do registro.
  type: 'Fatura' | 'Pagamento' | 'Despesa'; // Tipo do registro interno.
};

/**
 * Representa o resultado da conciliação de uma transação bancária.
 */
export type ReconciliationResult = {
  matched: boolean; // `true` se a transação bancária foi conciliada com um registro interno.
  bankTransaction: BankTransaction; // A transação bancária original.
  internalRecord?: InternalRecord; // O registro interno correspondente, se houver.
  promptForDetails?: string; // Sugestão gerada pela IA para ajudar na conciliação manual, se `matched` for `false`.
};

/**
 * Representa um orçamento gerado para um cliente.
 */
export type Orcamento = {
  id: string; // ID único do orçamento, gerado pelo Firestore.
  clientId: string; // ID do cliente associado.
  clientName: string; // Nome do cliente (denormalizado para fácil exibição).
  clientEmail: string; // Email do cliente (denormalizado).
  architect?: string; // Nome do arquiteto ou parceiro (opcional).
  environment: string; // Ambiente onde o produto será instalado (ex: "Banheiro Suíte").
  model: string; // Modelo do produto (ex: "Redondo", "Retangular").
  width: number; // Largura em cm.
  height: number; // Altura em cm.
  ledTemp: string; // Temperatura do LED (ex: "3000k").
  features?: string; // Recursos adicionais (ex: "anti-fog").
  price: number; // Preço final do orçamento.
  deliveryDate: string; // Data de entrega prevista, no formato ISO string.
  status: 'Pendente' | 'Aprovado' | 'Rejeitado'; // Status atual do orçamento.
  createdAt: string; // Data de criação do orçamento, no formato ISO string.
};

/**
 * Representa uma Nota Fiscal Eletrônica (NF-e) emitida.
 */
export type Invoice = {
  id: string; // ID único da fatura, gerado pelo Firestore.
  invoiceNumber: string; // Número da nota fiscal (ex: "NF-00123").
  accessKey?: string; // Chave de acesso da NF-e (44 dígitos, opcional).
  orderId: string; // ID do pedido ao qual esta fatura está associada.
  customerName: string; // Nome do cliente (denormalizado).
  date: string; // Data de emissão, no formato ISO string.
  status: 'Paga' | 'Pendente' | 'Cancelado'; // Status da fatura.
  total: number; // Valor total da fatura.
  createdAt: string; // Data de criação do registro no DB, no formato ISO string.
};

    