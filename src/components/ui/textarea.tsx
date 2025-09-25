/**
 * @fileoverview Componente de UI para uma área de texto (textarea) estilizada.
 *
 * Este é um componente de apresentação que encapsula um elemento `<textarea>`
 * com os estilos do Tailwind CSS definidos para o projeto, garantindo consistência visual.
 */

import * as React from 'react';

import {cn} from '@/lib/utils';

/**
 * Propriedades para o componente `Textarea`.
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
