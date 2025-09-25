/**
 * @fileoverview Página do servidor para a listagem de Usuários.
 *
 * Responsabilidades:
 * - Busca a lista inicial de usuários do Firebase Auth usando o Admin SDK via Server Action.
 * - Passa os dados para o componente de cliente `UsersContent` para renderização.
 * - Lida com erros durante a busca, retornando uma lista vazia.
 */
import { UsersContent } from './users-content';
import { getUsers } from './actions';

export const dynamic = 'force-dynamic'; // Garante que a página seja sempre re-renderizada

export default async function UsuariosPage() {
  const { users, error } = await getUsers();

  if (error) {
    console.error("Failed to fetch users:", error);
    // Você pode renderizar uma mensagem de erro aqui se preferir
  }

  return (
    <>
      <UsersContent initialUsers={users} />
    </>
  );
}
