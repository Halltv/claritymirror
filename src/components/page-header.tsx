/**
 * @fileoverview Componente reutilizável para criar um cabeçalho de página padrão.
 *
 * Responsabilidades:
 * - Exibir um título `h1` e uma descrição opcional.
 * - Fornecer um slot `children` para adicionar elementos de ação, como botões.
 * - Ser responsivo, ajustando o layout em telas menores.
 */

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  /** O título principal da página. */
  title: string;
  /** Uma breve descrição opcional que aparece abaixo do título. */
  description?: string;
  /** Elementos React (geralmente botões) a serem exibidos à direita do título. */
  children?: React.ReactNode;
  /** Classes CSS adicionais para customização. */
  className?: string;
};

/**
 * Renderiza um cabeçalho de página com título, descrição e ações.
 * @param {PageHeaderProps} props As propriedades do componente.
 */
export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6", className)}>
      <div className="grid gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex shrink-0 gap-2">{children}</div>}
    </div>
  );
}
