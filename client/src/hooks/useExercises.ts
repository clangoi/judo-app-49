import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const useExercises = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['exercises', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await api.getExercises();
    },
    enabled: !!userId,
  });

  const createExerciseMutation = useMutation({
    mutationFn: async (exerciseName: string) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      return await api.createExercise({
        name: exerciseName,
        userId: userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast({
        title: "Ejercicio creado",
        description: "El ejercicio ha sido creado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el ejercicio.",
        variant: "destructive",
      });
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      if (!userId) throw new Error('Usuario no autenticado');
      return await api.deleteExercise(exerciseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast({
        title: "Ejercicio eliminado",
        description: "El ejercicio ha sido eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el ejercicio.",
        variant: "destructive",
      });
    },
  });

  return {
    exercises,
    isLoading,
    createExerciseMutation,
    deleteExerciseMutation,
  };
};