/**
 * @fileoverview Página raiz da aplicação.
 *
 * Responsabilidade:
 * - Redirecionar o usuário da rota "/" para a rota "/login", que é a nova
 *   entrada do sistema. O `AuthProvider` cuidará de redirecionar para o 
 *   dashboard se o usuário já estiver logado.
 */

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
  return null;
}
