
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrainerAssignment {
  id: string;
  trainer_id: string;
  student_id: string;
  assigned_at: string;
  assigned_by: string | null;
}

interface TrainerStudent {
  student_id: string;
  full_name: string;
  email: string;
  assigned_at: string;
}

interface StudentTrainer {
  trainer_id: string;
  full_name: string;
  email: string;
  assigned_at: string;
}

export const useTrainerAssignments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener todos los usuarios con rol de entrenador
  const { data: trainers = [], isLoading: isLoadingTrainers } = useQuery({
    queryKey: ['trainers'],
    queryFn: async () => {
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'entrenador');
      
      if (rolesError) throw rolesError;

      const userIds = rolesData?.map(role => role.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);
      
      if (profilesError) throw profilesError;

      return rolesData?.map(role => ({
        ...role,
        profiles: profilesData?.find(profile => profile.user_id === role.user_id) || null
      })) || [];
    },
  });

  // Obtener todos los usuarios con rol de practicante
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'practicante');
      
      if (rolesError) throw rolesError;

      const userIds = rolesData?.map(role => role.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);
      
      if (profilesError) throw profilesError;

      return rolesData?.map(role => ({
        ...role,
        profiles: profilesData?.find(profile => profile.user_id === role.user_id) || null
      })) || [];
    },
  });

  // Obtener estudiantes asignados a un entrenador
  const getTrainerStudents = (trainerId: string) => {
    return useQuery({
      queryKey: ['trainer-students', trainerId],
      queryFn: async () => {
        const { data, error } = await supabase
          .rpc('get_trainer_students', { _trainer_id: trainerId });
        
        if (error) throw error;
        return data as TrainerStudent[];
      },
      enabled: !!trainerId,
    });
  };

  // Obtener el entrenador asignado a un estudiante
  const getStudentTrainer = (studentId: string) => {
    return useQuery({
      queryKey: ['student-trainer', studentId],
      queryFn: async () => {
        const { data, error } = await supabase
          .rpc('get_student_trainer', { _student_id: studentId });
        
        if (error) throw error;
        return data?.[0] as StudentTrainer | null;
      },
      enabled: !!studentId,
    });
  };

  // Asignar estudiante a entrenador
  const assignStudentMutation = useMutation({
    mutationFn: async ({ trainerId, studentId }: { trainerId: string; studentId: string }) => {
      const { data, error } = await supabase
        .from('trainer_assignments')
        .insert({
          trainer_id: trainerId,
          student_id: studentId,
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-students'] });
      queryClient.invalidateQueries({ queryKey: ['student-trainer'] });
      toast({
        title: "Asignación exitosa",
        description: "El practicante ha sido asignado al entrenador correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo realizar la asignación.",
        variant: "destructive",
      });
    }
  });

  // Remover asignación
  const removeAssignmentMutation = useMutation({
    mutationFn: async ({ trainerId, studentId }: { trainerId: string; studentId: string }) => {
      const { error } = await supabase
        .from('trainer_assignments')
        .delete()
        .eq('trainer_id', trainerId)
        .eq('student_id', studentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-students'] });
      queryClient.invalidateQueries({ queryKey: ['student-trainer'] });
      toast({
        title: "Asignación removida",
        description: "La asignación ha sido eliminada correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo remover la asignación.",
        variant: "destructive",
      });
    }
  });

  return {
    trainers,
    students,
    isLoadingTrainers,
    isLoadingStudents,
    getTrainerStudents,
    getStudentTrainer,
    assignStudentMutation,
    removeAssignmentMutation,
  };
};
