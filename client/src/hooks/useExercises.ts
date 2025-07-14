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
      return [];
    },
    enabled: !!userId,
  });

  const createExerciseMutation = useMutation({
    mutationFn: async (exerciseName: string) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      return {
        id: Date.now().toString(),
        name: exerciseName,
        description: '',
        muscle_group: '',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
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

  return {
    exercises,
    isLoading,
    createExerciseMutation,
  };
};