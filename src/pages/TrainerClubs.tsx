
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useClubs } from "@/hooks/useClubs";
import NavHeader from "@/components/NavHeader";
import ClubManagement from "@/components/admin/ClubManagement";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";

const TrainerClubs = () => {
  const { user } = useAuth();
  const { currentUserRole, isLoadingCurrentRole } = useUserRoles(user?.id);

  if (isLoadingCurrentRole) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C5A46C]" />
      </div>
    );
  }

  if (currentUserRole !== 'entrenador' && currentUserRole !== 'admin') {
    return (
      <div className="min-h-screen bg-[#1A1A1A]">
        <NavHeader 
          title="Gestión de Clubes" 
          subtitle="Administra los clubes de tus deportistas"
        />
        
        <div className="max-w-4xl mx-auto p-4">
          <Card className="bg-white border-[#C5A46C]">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto text-[#575757] mb-4" />
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">Acceso Denegado</h2>
              <p className="text-[#575757]">No tienes permisos para gestionar clubes</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title="Gestión de Clubes" 
        subtitle="Administra los clubes de tus deportistas"
      />
      
      <div className="max-w-6xl mx-auto p-4">
        <ClubManagement />
      </div>
    </div>
  );
};

export default TrainerClubs;
