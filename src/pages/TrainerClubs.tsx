
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (currentUserRole !== 'entrenador' && currentUserRole !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader 
          title="Gestión de Clubes" 
          subtitle="Administra los clubes de tus deportistas"
        />
        
        <div className="max-w-4xl mx-auto p-4">
          <Card className="bg-background border-border">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Acceso Denegado</h2>
              <p className="text-muted-foreground">No tienes permisos para gestionar clubes</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
