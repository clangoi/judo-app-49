import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
  const { data: trainers = [], isLoading: isLoadingTrainers, error: trainersError } = useQuery({
    queryKey: ['trainers'],
    queryFn: async () => {
      const response = await api.get('/api/admin/trainers');
      return response.data;
    },
  });

  // Obtener todos los usuarios con rol de deportista
  const { data: students = [], isLoading: isLoadingStudents, error: studentsError } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get('/api/admin/students');
      return response.data;
    },
  });

  // Obtener asignaciones actuales
  const { data: assignments = [], isLoading: isLoadingAssignments, error: assignmentsError } = useQuery({
    queryKey: ['trainer-assignments'],
    queryFn: async () => {
      const response = await api.get('/api/admin/trainer-assignments');
      return response.data;
    },
  });

  // Obtener deportistas asignados a un entrenador específico
  const getTrainerStudents = (trainerId: string): TrainerStudent[] => {
    return assignments
      .filter(assignment => assignment.trainer_id === trainerId)
      .map(assignment => {
        const student = students.find(s => s.id === assignment.student_id);
        return {
          student_id: assignment.student_id,
          full_name: student?.full_name || 'Nombre no disponible',
          email: student?.email || 'Email no disponible',
          assigned_at: assignment.assigned_at,
        };
      });
  };

  // Obtener entrenador asignado a un deportista específico
  const getStudentTrainer = (studentId: string): StudentTrainer | null => {
    const assignment = assignments.find(a => a.student_id === studentId);
    if (!assignment) return null;
    
    const trainer = trainers.find(t => t.id === assignment.trainer_id);
    if (!trainer) return null;
    
    return {
      trainer_id: assignment.trainer_id,
      full_name: trainer.full_name || 'Nombre no disponible',
      email: trainer.email || 'Email no disponible',
      assigned_at: assignment.assigned_at,
    };
  };

  // Asignar deportista a entrenador
  const assignStudentMutation = useMutation({
    mutationFn: async ({ trainerId, studentId }: { trainerId: string; studentId: string }) => {
      const response = await api.post('/api/admin/assign-student', {
        trainer_id: trainerId,
        student_id: studentId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: "Asignación exitosa",
        description: "El deportista ha sido asignado al entrenador.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo realizar la asignación.",
        variant: "destructive",
      });
    },
  });

  // Desasignar deportista de entrenador
  const unassignStudentMutation = useMutation({
    mutationFn: async ({ trainerId, studentId }: { trainerId: string; studentId: string }) => {
      const response = await api.delete('/api/admin/unassign-student', {
        data: {
          trainer_id: trainerId,
          student_id: studentId,
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: "Desasignación exitosa",
        description: "El deportista ha sido desasignado del entrenador.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo realizar la desasignación.",
        variant: "destructive",
      });
    },
  });

  return {
    trainers,
    students,
    assignments,
    isLoadingTrainers,
    isLoadingStudents,
    isLoadingAssignments,
    getTrainerStudents,
    getStudentTrainer,
    assignStudentMutation,
    unassignStudentMutation,
  };
};