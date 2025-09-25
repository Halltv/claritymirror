
/**
 * @fileoverview Provedor de Autenticação para gerenciar o estado do usuário.
 *
 * Responsabilidades:
 * - Criar um contexto React para armazenar as informações do usuário autenticado.
 * - Utilizar o `onAuthStateChanged` do Firebase para ouvir mudanças no estado de autenticação em tempo real.
 * - Proteger as rotas da aplicação:
 *   - Se um usuário não estiver logado e tentar acessar uma rota protegida, ele é redirecionado para `/login`.
 *   - Se um usuário já estiver logado e tentar acessar a página de login, ele é redirecionado para `/dashboard`.
 * - Expor os dados do usuário, o estado de carregamento e as funções de `login` e `logout` para os componentes filhos através do hook `useAuth`.
 */

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login';
    const isUsersPage = pathname === '/usuarios';
    const isAdmin = user?.email === 'admin@claritymirror.com';

    // Redireciona para login se não estiver logado e não estiver na página de login
    if (!user && !isAuthPage) {
      router.push('/login');
    } 
    // Redireciona para o dashboard se estiver logado e tentar acessar o login
    else if (user && isAuthPage) {
      router.push('/dashboard');
    }
    // Redireciona para o dashboard se não for admin e tentar acessar a página de usuários
    else if (user && !isAdmin && isUsersPage) {
      router.push('/dashboard');
    }

  }, [user, loading, pathname, router]);

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };
  
  const isAuthPage = pathname === '/login';

  // Mostra um spinner de carregamento em tela cheia enquanto verifica a autenticação
  // em rotas protegidas. Não mostra na página de login.
  if (loading && !isAuthPage) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
