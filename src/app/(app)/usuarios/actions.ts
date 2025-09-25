/**
 * @fileoverview Server Actions para o gerenciamento de usuários.
 * 
 * Este arquivo contém funções que rodam exclusivamente no servidor para interagir
 * com o Firebase Admin SDK, permitindo operações privilegiadas como a criação
 * e listagem de usuários.
 */

'use server';

// A importação abaixo garante que o Admin SDK seja inicializado antes que qualquer
// uma dessas funções seja chamada.
import '@/lib/firebase-admin';

import { adminAuth } from '@/lib/firebase-admin';
import type { AppUser, NewUser } from '@/types/user';

/**
 * Cria um novo usuário no Firebase Authentication.
 * @param userData - Os dados do novo usuário (email, senha, nome).
 * @returns Um objeto indicando sucesso ou falha, com os dados do usuário ou uma mensagem de erro.
 */
export async function createUser(userData: NewUser): Promise<{ success: boolean; user?: AppUser; error?: string }> {
    if (!adminAuth) {
        console.error("Erro em createUser: Firebase Admin não inicializado.");
        return { success: false, error: 'Firebase Admin não inicializado.' };
    }

    try {
        const userRecord = await adminAuth.createUser({
            email: userData.email,
            password: userData.password,
            displayName: userData.displayName,
            emailVerified: true,
            disabled: false,
        });

        const user: AppUser = {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            disabled: userRecord.disabled,
            createdAt: userRecord.metadata.creationTime,
        };

        return { success: true, user: user };
    } catch (error: any) {
        console.error("Error creating user in Server Action:", error);
        let errorMessage = 'Ocorreu um erro desconhecido.';
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Este endereço de email já está em uso por outro usuário.';
        } else if (error.code === 'auth/invalid-password') {
            errorMessage = 'A senha deve ter no mínimo 6 caracteres.';
        }
        return { success: false, error: errorMessage };
    }
}

/**
 * Busca e retorna todos os usuários do Firebase Authentication.
 * @returns Um objeto com a lista de usuários ou uma mensagem de erro.
 */
export async function getUsers(): Promise<{ users: AppUser[], error?: string }> {
     if (!adminAuth) {
        console.error("Erro em getUsers: Firebase Admin não inicializado.");
        return { users: [], error: 'Firebase Admin não inicializado.' };
    }

    try {
        const listUsersResult = await adminAuth.listUsers(1000); // Limite de 1000 por página
        const users = listUsersResult.users.map(userRecord => ({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            disabled: userRecord.disabled,
            createdAt: userRecord.metadata.creationTime,
        }));
        
        // Ordena por data de criação, mais recente primeiro
        users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return { users };
    } catch (error: any) {
        console.error('Error fetching users:', error);
        return { users: [], error: 'Não foi possível buscar os usuários.' };
    }
}
