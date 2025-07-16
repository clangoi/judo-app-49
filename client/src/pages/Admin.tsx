
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import NavHeader from "@/components/NavHeader";
import UserRoleManagement from "@/components/admin/UserRoleManagement";
import TrainerAssignmentManagement from "@/components/admin/TrainerAssignmentManagement";
import AdminAthleteManagement from "@/components/admin/AdminAthleteManagement";
import ClubManagement from "@/components/admin/ClubManagement";
import { AdminSports } from "./AdminSports";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Loader2 } from "lucide-react";


const Admin = () => {
  const { user } = useAuth();
  const { currentUserRole, isLoadingCurrentRole } = useUserRoles(user?.id);

  if (isLoadingCurrentRole) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C5A46C]" />
      </div>
    );
  }

  if (currentUserRole !== 'admin') {
    return (
      <div className="min-h-screen bg-[#1A1A1A]">
        <NavHeader 
          title="Administración" 
          subtitle="Panel de administración del sistema"
        />
        
        <div className="max-w-4xl mx-auto p-4">
          <Card className="bg-white border-[#C5A46C]">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto text-[#575757] mb-4" />
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">Acceso Denegado</h2>
              <p className="text-[#575757]">No tienes permisos para acceder al panel de administración</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title="Administración" 
        subtitle="Panel de administración del sistema"
      />
      
      <div className="max-w-6xl mx-auto p-4">
        

        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
            <TabsTrigger value="clubs">Clubes</TabsTrigger>
            <TabsTrigger value="athletes">Deportistas</TabsTrigger>
            <TabsTrigger value="sports">Deportes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="roles" className="space-y-6">
            <UserRoleManagement />
          </TabsContent>
          
          <TabsContent value="assignments" className="space-y-6">
            <TrainerAssignmentManagement />
          </TabsContent>

          <TabsContent value="clubs" className="space-y-6">
            <ClubManagement />
          </TabsContent>

          <TabsContent value="athletes" className="space-y-6">
            <AdminAthleteManagement />
          </TabsContent>

          <TabsContent value="sports" className="space-y-6">
            <AdminSports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
