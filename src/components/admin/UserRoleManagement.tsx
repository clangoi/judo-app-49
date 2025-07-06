
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles, AppRole } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Loader2 } from "lucide-react";

const UserRoleManagement = () => {
  const { user } = useAuth();
  const { 
    allUserRoles, 
    isLoadingAllRoles, 
    assignRoleMutation,
    isAdmin 
  } = useUserRoles(user?.id);
  
  const [selectedRoles, setSelectedRoles] = useState<Record<string, AppRole>>({});

  if (!isAdmin()) {
    return (
      <Card className="bg-white border-[#C5A46C]">
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 mx-auto text-[#575757] mb-4" />
          <p className="text-[#575757]">No tienes permisos para acceder a esta sección</p>
        </CardContent>
      </Card>
    );
  }

  const handleRoleChange = (userId: string, newRole: AppRole) => {
    setSelectedRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  const handleSaveRole = (userId: string) => {
    const newRole = selectedRoles[userId];
    if (newRole) {
      assignRoleMutation.mutate({ userId, role: newRole });
    }
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'entrenador':
        return 'default';
      case 'deportista':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getRoleLabel = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'entrenador':
        return 'Entrenador';
      case 'deportista':
        return 'Deportista';
      default:
        return role;
    }
  };

  if (isLoadingAllRoles) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#C5A46C]" />
      </div>
    );
  }

  return (
    <Card className="bg-white border-[#C5A46C]">
      <CardHeader>
        <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
          <Users className="h-5 w-5 text-[#C5A46C]" />
          Gestión de Roles de Usuario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {allUserRoles.length === 0 ? (
          <p className="text-[#575757] text-sm italic">No hay usuarios registrados aún.</p>
        ) : (
          <div className="space-y-3">
            {allUserRoles.map((userRole) => (
              <div key={userRole.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-[#1A1A1A]">
                      {userRole.profiles?.full_name || 'Usuario sin nombre'}
                    </span>
                    <Badge variant={getRoleBadgeVariant(userRole.role)}>
                      {getRoleLabel(userRole.role)}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#575757]">
                    {userRole.profiles?.email || 'Sin email'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedRoles[userRole.user_id] || userRole.role}
                    onValueChange={(value: AppRole) => handleRoleChange(userRole.user_id, value)}
                  >
                    <SelectTrigger className="w-36 border-[#C5A46C] focus:border-[#C5A46C]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deportista">Deportista</SelectItem>
                      <SelectItem value="entrenador">Entrenador</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => handleSaveRole(userRole.user_id)}
                    disabled={!selectedRoles[userRole.user_id] || selectedRoles[userRole.user_id] === userRole.role || assignRoleMutation.isPending}
                    className="bg-[#C5A46C] hover:bg-[#B8956A] text-white"
                    size="sm"
                  >
                    {assignRoleMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Guardar"
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserRoleManagement;
