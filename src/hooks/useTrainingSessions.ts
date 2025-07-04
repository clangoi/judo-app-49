
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SesionPreparacion {
  id: string;
  date: string;
  session_type: string;
  duration_minutes: number;
  notes: string;
  intensity: number;
}

interface ExerciseRecord {
  exercise_id: string;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  duration_minutes?: number;
  notes?: string;
  saved?: boolean;
}

export const useTrainingSessions = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sesiones = [], isLoading } = useQuery({
    queryKey: ['training_sessions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: ejercicios = [] } = useQuery({
    queryKey: ['exercises', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const createSessionMutation = useMutation({
    mutationFn: async ({ sesion, ejerciciosRealizados }: { 
      sesion: Omit<SesionPreparacion, 'id'>, 
      ejerciciosRealizados: ExerciseRecord[] 
    }) => {
      const { data: sessionData, error: sessionError } = await supabase
        .from('training_sessions')
        .insert([{
          ...sesion,
          user_id: userId!
        }])
        .select()
        .single();
      
      if (sessionError) throw sessionError;

      // Create exercise records (only include database fields)
      for (const ejercicio of ejerciciosRealizados) {
        if (ejercicio.exercise_id) {
          const recordToInsert = {
            exercise_id: ejercicio.exercise_id,
            sets: ejercicio.sets,
            reps: ejercicio.reps,
            weight_kg: ejercicio.weight_kg,
            duration_minutes: ejercicio.duration_minutes,
            notes: ejercicio.notes,
            training_session_id: sessionData.id,
            user_id: userId!,
            date: sesion.date
          };
          
          const { error: recordError } = await supabase
            .from('exercise_records')
            .insert([recordToInsert]);
          
          if (recordError) throw recordError;
        }
      }
      
      return sessionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast({
        title: "Sesión guardada",
        description: "Tu sesión de preparación ha sido registrada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la sesión.",
        variant: "destructive",
      });
    }
  });

  return {
    sesiones,
    ejercicios,
    isLoading,
    createSessionMutation
  };
};
