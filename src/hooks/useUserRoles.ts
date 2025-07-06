
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

// Usar los tipos correctos de la base de datos
export type AppRole = 'practicante' | 'entrenador' | 'admin';

// Usar el tipo de la base de datos para la mutación
type DatabaseRole = Database['public']['Enums']['app_role'];

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_at: string;
  assigned_by: string | null;
}

export const useUserRoles = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener el rol del usuario actual
  const { data: currentUserRole, isLoading: isLoadingCurrentRole } = useQuery({
    queryKey: ['user-role', userId],
    queryFn: async () => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .rpc('get_user_role', { _user_id: userId });
      
      if (error) throw error;
      return data as AppRole | null;
    },
    enabled: !!userId,
  });

  // Obtener todos los roles (solo para admins)
  const { data: allUserRoles = [], isLoading: isLoadingAllRoles } = useQuery({
    queryKey: ['all-user-roles'],
    queryFn: async () => {
      // Primero obtenemos los roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('assigned_at', { ascending: false });
      
      if (rolesError) throw rolesError;

      // Luego obtenemos los profiles correspondientes
      const userIds = rolesData?.map(role => role.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);
      
      if (profilesError) throw profilesError;

      // Combinamos la data
      const combinedData = rolesData?.map(role => ({
        ...role,
        profiles: profilesData?.find(profile => profile.user_id === role.user_id) || null
      })) || [];

      return combinedData as (UserRole & { profiles: { full_name: string; email: string } | null })[];
    },
    enabled: currentUserRole === 'admin',
  });

  // Asignar rol a usuario
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId: targetUserId, role }: { userId: string; role: AppRole }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: targetUserId,
          role: role as DatabaseRole,
          assigned_by: userId
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      toast({
        title: "Rol asignado",
        description: "El rol ha sido asignado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo asignar el rol.",
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
