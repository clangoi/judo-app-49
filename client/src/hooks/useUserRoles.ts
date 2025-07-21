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
      
      try {
        // Try to get role from database first
        const response = await fetch(`/api/user-roles`);
        if (response.ok) {
          const allRoles = await response.json();
          // Find the most recent role for this user (in case of duplicates)
          const userRoles = allRoles.filter((role: any) => role.user_id === userId);
          if (userRoles.length > 0) {
            // Get the most recent role assignment
            const latestRole = userRoles.sort((a: any, b: any) => 
              new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime()
            )[0];
            return latestRole.role as AppRole;
          }
        }
      } catch (error) {
        console.warn('Error fetching role from database, using fallback logic:', error);
      }
      
      // Fallback to hardcoded logic for known users
      const trainerIds = [
        '550e8400-e29b-41d4-a716-446655443323', // entrenador@test.com
        '1a0e8400-e29b-41d4-a716-446655443001', // carlos.martinez@dojo.com
        '1a0e8400-e29b-41d4-a716-446655443002', // maria.rodriguez@clubjudo.com
        '1a0e8400-e29b-41d4-a716-446655443003', // luis.garcia@academiajiujitsu.com
        '1a0e8400-e29b-41d4-a716-446655443004', // ana.lopez@karatedojo.com
        '1a0e8400-e29b-41d4-a716-446655443005', // diego.fernandez@judoclub.com
        '550e8406-e29b-41d4-a716-446655443322', // sensei.yamamoto@example.com
        '550e8407-e29b-41d4-a716-446655443322', // maestra.gonzalez@example.com
        '550e8400-e29b-41d4-a716-446655440001'  // Test trainer fallback
      ];

      const adminIds = [
        '550e8400-e29b-41d4-a716-446655443322' // claudita06.99@gmail.com
      ];

      // Check if user is admin
      if (adminIds.includes(userId)) {
        return 'admin' as AppRole;
      }
      
      // Check if user is trainer
      if (trainerIds.includes(userId)) {
        return 'entrenador' as AppRole;
      }
      
      // Fallback patterns for dynamic users
      if (userId.includes('admin')) {
        return 'admin' as AppRole;
      } else if (userId.includes('trainer') || userId.includes('entrenador')) {
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
      // Invalidate all role-related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['all-user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      
      // Force reload the page data to ensure UI updates
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['all-user-roles'] });
        queryClient.refetchQueries({ queryKey: ['user-role'] });
      }, 100);
      
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