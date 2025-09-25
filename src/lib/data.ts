/**
 * @fileoverview
 * Este arquivo contém dados estáticos (mock data) para fins de desenvolvimento e demonstração.
 * Em uma aplicação de produção completa, esses dados seriam buscados de um banco de dados
 * ou de uma API, em vez de estarem fixos no código. No estado atual do projeto, algumas
 * entidades (como Clientes e Pedidos) já são buscadas do Firestore, enquanto outras
 * (como o resumo financeiro) ainda utilizam estes dados estáticos.
 */

import { Order, Invoice, Client } from '@/types';

// Dados de exemplo para a tabela de pedidos.
// ATENÇÃO: Os pedidos agora são buscados do Firestore. Este array é um fallback ou referência.
export const orders: Order[] = [
  { id: 'ORD001', customer: { name: 'Empresa Alpha', email: 'contact@alpha.com' }, date: '2023-10-26', amount: 250.0, status: 'Entregue', outstanding: 0.0 },
  { id: 'ORD002', customer: { name: 'Soluções Beta', email: 'sales@beta.com' }, date: '2023-10-28', amount: 150.5, status: 'Processando', outstanding: 150.5 },
  { id: 'ORD003', customer: { name: 'Construções Gamma', email: 'finance@gamma.com' }, date: '2023-10-29', amount: 350.75, status: 'Enviado', outstanding: 0.0 },
  { id: 'ORD004', customer: { name: 'Delta E-commerce', email: 'support@delta.com' }, date: '2023-10-30', amount: 75.0, status: 'Exceção', outstanding: 75.0 },
  { id: 'ORD005', customer: { name: 'Epsilon Tech', email: 'tech@epsilon.com' }, date: '2023-11-01', amount: 500.0, status: 'Entregue', outstanding: 0.0 },
  { id: 'ORD006', customer: { name: 'Zeta Corp', email: 'accounts@zeta.com' }, date: '2023-11-02', amount: 200.0, status: 'Cancelado', outstanding: 0.0 },
  { id: 'ORD007', customer: { name: 'Eta Services', email: 'services@eta.com' }, date: '2023-11-03', amount: 120.0, status: 'Processando', outstanding: 120.0 },
];

// Dados de exemplo para a tabela de faturas (NF-e).
// ATENÇÃO: As faturas agora são buscadas do Firestore. Este array é um fallback ou referência.
export const invoices: Invoice[] = [
    { id: "INV001", invoiceNumber: "NF-001", orderId: "ORD001", customerName: "Empresa Alpha", date: "2023-10-26", status: "Paga", total: 250.00, createdAt: "2023-10-26" },
    { id: "INV002", invoiceNumber: "NF-002", orderId: "ORD003", customerName: "Construções Gamma", date: "2023-10-29", status: "Paga", total: 350.75, createdAt: "2023-10-29" },
    { id: "INV003", invoiceNumber: "NF-003", orderId: "ORD005", customerName: "Epsilon Tech", date: "2023-11-01", status: "Paga", total: 500.00, createdAt: "2023-11-01" },
    { id: "INV004", invoiceNumber: "NF-004", orderId: "ORD002", customerName: "Soluções Beta", date: "2023-11-05", status: "Pendente", total: 150.50, createdAt: "2023-11-05" },
];

// Dados de exemplo para a lista de clientes.
// ATENÇÃO: Os clientes agora são buscados do Firestore. Este array é um fallback ou referência.
export const clients: Client[] = [
  { id: 'CLI001', name: 'Empresa Alpha', email: 'contact@alpha.com', phone: '(11) 98765-4321', company: 'Alpha Inc.', createdAt: '2023-01-15' },
  { id: 'CLI002', name: 'Soluções Beta', email: 'sales@beta.com', phone: '(21) 91234-5678', company: 'Beta Solutions', createdAt: '2023-02-20' },
  { id: 'CLI003', name: 'Construções Gamma', email: 'finance@gamma.com', phone: '(31) 95555-1212', company: 'Gamma Constructions', createdAt: '2023-03-10' },
];

// Dados estáticos para os cartões de resumo financeiro no Dashboard.
export const financialSummary = {
  revenue: 45230.50,
  expenses: 21780.20,
  profit: 23450.30,
  lastMonthProfit: 19870.00,
};

// Dados estáticos para o gráfico de barras "Orçamento vs. Real" no Dashboard.
export const budgetChartData = [
  { month: 'Jan', budget: 5000, actual: 4500 },
  { month: 'Feb', budget: 5200, actual: 5100 },
  { month: 'Mar', budget: 5500, actual: 5600 },
  { month: 'Apr', budget: 5300, actual: 5100 },
  { month: 'May', budget: 5800, actual: 6000 },
  { month: 'Jun', budget: 6000, actual: 5800 },
  { month: 'Jul', budget: 6200, actual: 6300 },
  { month: 'Aug', budget: 6100, actual: 5900 },
  { month: 'Sep', budget: 6500, actual: 6600 },
  { month: 'Oct', budget: 6800, actual: 6700 },
  { month: 'Nov', budget: 7000, actual: 0 },
  { month: 'Dec', budget: 7200, actual: 0 },
];
