import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Usar los tipos correctos de la base de datos
export type AppRole = 'deportista' | 'entrenador' | 'admin';

// Database role type
type DatabaseRole = 'deportista' | 'entrenador' | 'admin';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_at: string;
  assigned_by: string | null;
  full_name: string | null;
  email: string | null;
}

export const useUserRoles = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener el rol del usuario actual
  const { data: currentUserRole, isLoading: isLoadingCurrentRole } = useQuery({
    queryKey: ['user-role', userId],
    queryFn: async () => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      // Determine role based on user ID for testing
      // Special case for claudita06.99@gmail.com admin user
      if (userId === '550e8400-e29b-41d4-a716-446655443322') {
        return 'admin' as AppRole;
      } else if (userId.includes('admin')) {
        return 'admin' as AppRole;
      } else if (userId.includes('trainer') || userId.includes('entrenador') || userId === '550e8400-e29b-41d4-a716-446655440001') {
        return 'entrenador' as AppRole;
      } else {
        return 'deportista' as AppRole;
      }
    },
    enabled: !!userId,
  });

  // Obtener todos los roles (solo para admins)
  const { data: allUserRoles = [], isLoading: isLoadingAllRoles } = useQuery({
    queryKey: ['all-user-roles'],
    queryFn: async () => {
      return await api.getUserRoles();
    },
    enabled: currentUserRole === 'admin',
  });

  // Asignar rol a usuario
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId: targetUserId, role }: { userId: string; role: AppRole }) => {
      return await api.updateUserRole({
        userId: targetUserId,
        role: role as DatabaseRole,
        assignedBy: userId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      toast({
        title: "Rol actualizado",
        description: "El rol ha sido actualizado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el rol.",
        variant: "destructive",
      });
    }
  });

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role: AppRole): boolean => {
    return currentUserRole === role;
  };

  // Verificar si el usuario es admin
  const isAdmin = (): boolean => {
    return currentUserRole === 'admin';
  };

  // Verificar si el usuario es entrenador o admin
  const canManageUsers = (): boolean => {
    return currentUserRole === 'entrenador' || currentUserRole === 'admin';
  };

  return {
    currentUserRole,
    allUserRoles,
    isLoadingCurrentRole,
    isLoadingAllRoles,
    assignRoleMutation,
    hasRole,
    isAdmin,
    canManageUsers,
  };
};