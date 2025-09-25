/**
 * @fileoverview Wrapper para o provedor de temas `next-themes`.
 *
 * Responsabilidades:
 * - Encapsular o `NextThemesProvider` em um componente de cliente ('use client').
 * - Permitir que a aplicação alterne entre temas (claro, escuro, sistema) de forma segura no Next.js App Router.
 */

"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

/**
 * Provedor de temas que habilita a troca de tema na aplicação.
 * @param {ThemeProviderProps} props Propriedades do NextThemesProvider.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
