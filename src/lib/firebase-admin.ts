/**
 * @fileoverview
 * Este arquivo é responsável pela inicialização e configuração do Firebase Admin SDK no servidor.
 * O Admin SDK permite interações privilegiadas com os serviços do Firebase, como o Auth e o Firestore,
 * bypassando as regras de segurança. É essencial para operações de back-end, como gerenciamento de usuários.
 *
 * **IMPORTANTE:** Este arquivo e suas credenciais só devem ser usados no lado do servidor (Server Actions, API Routes).
 */

import admin from 'firebase-admin';

// Evita a reinicialização do app, um erro comum em ambientes de desenvolvimento com hot-reloading.
if (!admin.apps.length) {
  try {
    // Inicializa o Admin SDK usando as credenciais fornecidas pelas variáveis de ambiente.
    // O `replace` é um workaround para lidar com a formatação de chaves privadas em variáveis de ambiente.
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.SERVICE_ACCOUNT_PROJECT_ID,
        clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
        privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error("Falha ao inicializar o Firebase Admin:", error);
    // Em um ambiente de produção, seria ideal ter um mecanismo de alerta para essa falha.
  }
}

/**
 * Instância do serviço de autenticação do Admin SDK.
 * É exportada como `null` se a inicialização falhar para evitar erros em cascata.
 */
const adminAuth = admin.apps.length ? admin.auth() : null;

export { adminAuth };
