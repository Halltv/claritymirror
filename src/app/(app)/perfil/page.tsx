/**
 * @fileoverview Página de Perfil do Usuário.
 *
 * Responsabilidades:
 * - Exibir o cabeçalho da página.
 * - Renderizar o componente `ProfileForm` que contém a lógica para atualização do perfil.
 */

import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "./profile-form";
import { Separator } from "@/components/ui/separator";

export default function PerfilPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfil"
        description="Gerencie as informações do seu perfil pessoal."
      />
      <Separator />
      <ProfileForm />
    </div>
  );
}
