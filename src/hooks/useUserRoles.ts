
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
      
      const { data, error } = await supabase
        .rpc('get_user_role', { _user_id: userId });
      
      if (error) throw error;
      return data as AppRole | null;
    },
    enabled: !!userId,
  });

  // Obtener todos los roles (solo para admins) - query simplificada con JOIN
  const { data: allUserRoles = [], isLoading: isLoadingAllRoles } = useQuery({
    queryKey: ['all-user-roles'],
    queryFn: async () => {
      // Una sola query con JOIN para obtener todos los datos necesarios
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          assigned_at,
          assigned_by,
          profiles!inner(
            full_name,
            email
          )
        `)
        .order('assigned_at', { ascending: false });
      
      if (error) throw error;

      // Transformar los datos para que coincidan con la interfaz esperada
      const transformedData = data?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        role: item.role as AppRole,
        assigned_at: item.assigned_at,
        assigned_by: item.assigned_by,
        full_name: item.profiles?.full_name || null,
        email: item.profiles?.email || null
      })) || [];

      return transformedData as UserRole[];
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
