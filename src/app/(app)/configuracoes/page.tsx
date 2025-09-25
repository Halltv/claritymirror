/**
 * @fileoverview Página de Configurações, agora com renderização condicional.
 *
 * Responsabilidades:
 * - Renderizar os formulários de configuração comuns a todos os usuários.
 * - Usar o hook `useAuth` para verificar se o usuário logado é um administrador.
 * - Renderizar condicionalmente o formulário "Dados da Empresa" apenas para administradores.
 */
'use client';

import { PageHeader } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";
import { AccountSecurityForm } from "./account-security-form";
import { ThemeSettingsForm } from "./theme-settings-form";
import { NotificationsForm } from "./notifications-form";
import { CompanyDataForm } from "./company-data-form";
import { useAuth } from "@/components/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";


export default function ConfiguracoesPage() {
  const { user, loading } = useAuth();
  const isAdmin = user?.email === 'admin@claritymirror.com';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações da sua conta e preferências do site."
      />

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : (
        <>
          {isAdmin && (
            <>
              <CompanyDataForm />
              <Separator />
            </>
          )}
          <AccountSecurityForm />
          <Separator />
          <ThemeSettingsForm />
          <Separator />
          <NotificationsForm />
        </>
      )}
    </div>
  );
}
