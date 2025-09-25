/**
 * @fileoverview Componente que define o layout de um orçamento para geração de PDF.
 *
 * Este componente não é exibido diretamente na UI. Ele é renderizado de forma oculta
 * para que a biblioteca html2canvas possa capturá-lo como uma imagem e, em seguida,
 * a jspdf possa inseri-lo em um arquivo PDF.
 *
 * O estilo é aplicado diretamente e de forma simples para garantir a melhor
 * compatibilidade possível com o html2canvas.
 */

import { Logo } from '@/components/icons';
import { MirrorModelPreview } from '@/components/mirror-model-preview';
import type { Orcamento } from '@/types';

interface OrcamentoPdfLayoutProps {
  orcamento: Orcamento;
}

export function OrcamentoPdfLayout({ orcamento }: OrcamentoPdfLayoutProps) {
  const companyDetails = {
    name: 'ClarityMirror',
    address: 'Rua das Inovações, 123, Sala 45',
    city: 'São Paulo - SP, 01234-567',
    phone: '(11) 4004-4004',
    email: 'contato@claritymirror.com',
  };

  const productDescription = "Espelho ClearMirror com iluminação LED integrada.";

  return (
    <div className="bg-white text-gray-800 p-12 font-sans text-sm w-[800px]">
      {/* Cabeçalho */}
      <header className="flex justify-between items-start pb-6 border-b-2 border-gray-200">
        <div className="flex items-center gap-4">
          <Logo className="h-12 w-12 text-gray-700" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{companyDetails.name}</h1>
            <p className="text-xs text-gray-500">{companyDetails.address}</p>
            <p className="text-xs text-gray-500">{companyDetails.phone} | {companyDetails.email}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-gray-500 uppercase">Orçamento</h2>
          <p className="text-gray-600">ID: {orcamento.id.substring(0, 10)}</p>
          <p className="text-gray-600">Data: {new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
      </header>

      {/* Detalhes do Cliente e Arquiteto */}
      <section className="grid grid-cols-2 gap-8 mt-6">
        <div>
          <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-2">Cliente</h3>
          <p className="font-bold">{orcamento.clientName}</p>
          <p>{orcamento.clientEmail}</p>
        </div>
        {orcamento.architect && (
          <div className="text-right">
            <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-2">Arquiteto/Parceiro</h3>
            <p className="font-bold">{orcamento.architect}</p>
          </div>
        )}
      </section>

      {/* Tabela de Itens */}
      <section className="mt-8">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3 font-semibold uppercase text-xs text-gray-600">Descrição</th>
              <th className="p-3 font-semibold uppercase text-xs text-gray-600">Detalhes</th>
              <th className="p-3 font-semibold uppercase text-xs text-gray-600 text-right">Valor Unit.</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="p-3">
                <p className="font-bold">{productDescription}</p>
                <div className="flex items-center gap-4 mt-2">
                    <MirrorModelPreview model={orcamento.model as any} className="w-16 h-16 text-gray-400" />
                    <div>
                        <p className="text-xs text-gray-500"><strong>Modelo:</strong> <span className="capitalize">{orcamento.model.replace('-', ' ')}</span></p>
                        <p className="text-xs text-gray-500"><strong>Ambiente:</strong> {orcamento.environment}</p>
                    </div>
                </div>
              </td>
              <td className="p-3 text-xs text-gray-600">
                <p><strong>Medidas:</strong> {orcamento.width}cm x {orcamento.height}cm</p>
                <p><strong>LED:</strong> {orcamento.ledTemp}</p>
                {orcamento.features && orcamento.features !== 'none' && (
                    <p><strong>Adicional:</strong> <span className="capitalize">{orcamento.features.replace('-', ' ')}</span></p>
                )}
              </td>
              <td className="p-3 text-right font-mono">
                R$ {orcamento.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Total e Prazos */}
      <section className="grid grid-cols-2 mt-8 gap-8 items-start">
        <div>
          <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-2">Prazo de Entrega</h3>
          <p>Data prevista: <strong>{new Date(orcamento.deliveryDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</strong></p>
          <p className="text-xs text-gray-500 mt-2">O prazo pode variar de acordo com a confirmação do pagamento e disponibilidade.</p>
        </div>
        <div className="text-right">
            <div className="bg-gray-50 p-4 rounded-lg inline-block text-left">
                <div className="flex justify-between items-center gap-8">
                    <p className="text-gray-600">Subtotal</p>
                    <p className="font-mono">R$ {orcamento.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                 <div className="flex justify-between items-center gap-8 font-bold text-lg mt-2 pt-2 border-t border-gray-200">
                    <p>Total</p>
                    <p className="font-mono">R$ {orcamento.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
            </div>
        </div>
      </section>

      {/* Rodapé e Assinatura */}
      <footer className="mt-20 pt-8 border-t-2 border-gray-200">
        <div className="grid grid-cols-2 gap-8 items-center">
            <div className="text-xs text-gray-500">
                <p>Orçamento válido por 15 dias.</p>
                <p>Agradecemos a sua preferência!</p>
            </div>
            <div className="text-center">
                <div className="border-t border-gray-400 w-64 mx-auto pt-2">
                    <p className="text-sm">Assinatura do Cliente</p>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
