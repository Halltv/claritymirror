/**
 * @fileoverview
 * Este arquivo é responsável pela inicialização e configuração do Firebase na aplicação.
 * Ele exporta as instâncias dos principais serviços do Firebase (App, Firestore, Auth)
 * para serem utilizadas em outras partes do código.
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Objeto de configuração do Firebase.
// Estes valores são públicos e servem para identificar seu projeto Firebase no frontend.
// As regras de segurança do Firestore e do Auth garantem que os dados estejam protegidos.
const firebaseConfig = {
  apiKey: "AIzaSyA_LJti2AK39g_scVieKoKLNgwwFGr5bWM",
  authDomain: "studio-6773646824-df45e.firebaseapp.com",
  projectId: "studio-6773646824-df45e",
  storageBucket: "studio-6773646824-df45e.firebasestorage.app",
  messagingSenderId: "632301217569",
  appId: "1:632301217569:web:4c815c65a607da4eb04060"
};


// Inicializa o Firebase, mas apenas se ainda não tiver sido inicializado.
// Isso evita erros de reinicialização, especialmente com o Hot Module Replacement (HMR) do Next.js.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Obtém a instância do Firestore para interagir com o banco de dados.
const db = getFirestore(app);

// Obtém a instância do Firebase Auth para gerenciar a autenticação de usuários.
const auth = getAuth(app);

// Exporta as instâncias para serem usadas em toda a aplicação.
export { app, db, auth };
