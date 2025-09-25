
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
