
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useExercises = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['exercises', userId],
    queryFn: async () => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const createExerciseMutation = useMutation({
    mutationFn: async (exerciseName: string) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('exercises')
        .insert([{ name: exerciseName, user_id: userId }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises', userId] });
      toast({
        title: "Ejercicio creado",
        description: "El ejercicio ha sido agregado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el ejercicio.",
        variant: "destructive",
      });
    }
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      // Check if exercise is being used in any exercise records
      const { data: records, error: recordsError } = await supabase
        .from('exercise_records')
        .select('id')
        .eq('exercise_id', exerciseId)
        .limit(1);

      if (recordsError) throw recordsError;

      if (records && records.length > 0) {
        throw new Error('No se puede eliminar el ejercicio porque tiene registros asociados');
      }

      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises', userId] });
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
    }
  });

  return {
    exercises,
    isLoading,
    createExerciseMutation,
    deleteExerciseMutation,
  };
};
