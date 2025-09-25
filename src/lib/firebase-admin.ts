/**
 * @fileoverview
 * Este arquivo é responsável pela inicialização e configuração do Firebase Admin SDK no servidor.
 * Ele exporta a instância do Admin SDK para ser utilizada em Server Actions e rotas de API
 * para realizar operações privilegiadas, como criar usuários ou acessar dados com regras de segurança elevadas.
 */

import admin from 'firebase-admin';

// Verifica se já existem apps inicializados para evitar erros de reinicialização.
if (!admin.apps.length) {
  try {
    // Tenta inicializar usando as variáveis de ambiente, que é a forma mais segura.
    // O `replace` é necessário porque as variáveis de ambiente não lidam bem com quebras de linha.
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.SERVICE_ACCOUNT_PROJECT_ID,
        clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
        privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error("Falha ao inicializar o Firebase Admin:", error);
    // Em produção, você pode querer lidar com isso de forma mais robusta.
  }
}

// Exporta o serviço de autenticação do Admin SDK.
// A verificação `admin.apps.length` garante que só tentaremos acessar `auth()` se a inicialização foi bem-sucedida.
const adminAuth = admin.apps.length ? admin.auth() : null;

export { adminAuth };
