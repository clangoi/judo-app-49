
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
  rest_seconds?: number;
  notes?: string;
}

export const useTrainingSessions = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sesiones = [], isLoading } = useQuery({
    queryKey: ['training_sessions', userId],
    queryFn: async () => {
      if (!userId) throw new Error('Usuario no autenticado');
      const data = await api.getTrainingSessions(userId);
      // Map server data (camelCase) to frontend interface (snake_case)
      return data.map((session: any) => ({
        id: session.id,
        date: session.date,
        session_type: session.sessionType,
        duration_minutes: session.durationMinutes,
        notes: session.notes,
        intensity: session.intensity
      }));
    },
    enabled: !!userId,
  });

  const { data: ejercicios = [] } = useQuery({
    queryKey: ['exercises', userId],
    queryFn: async () => {
      if (!userId) throw new Error('Usuario no autenticado');
      return await api.getExercises();
    },
    enabled: !!userId,
  });



  const createSessionMutation = useMutation({
    mutationFn: async ({ sesion, ejerciciosRealizados }: { 
      sesion: Omit<SesionPreparacion, 'id'>, 
      ejerciciosRealizados: ExerciseRecord[] 
    }) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      const sessionResponse = await api.createTrainingSession({
        userId,
        date: sesion.date,
        sessionType: sesion.session_type,
        durationMinutes: sesion.duration_minutes,
        notes: sesion.notes,
        intensity: sesion.intensity,
        trainingCategory: 'physical_preparation'
      });

      // Create exercise records
      for (const ejercicio of ejerciciosRealizados) {
        if (ejercicio.exercise_id) {
          await api.createExerciseRecord({
            exerciseId: ejercicio.exercise_id,
            sets: ejercicio.sets,
            reps: ejercicio.reps,
            weightKg: ejercicio.weight_kg,
            durationMinutes: ejercicio.duration_minutes,
            restSeconds: ejercicio.rest_seconds,
            notes: ejercicio.notes,
            trainingSessionId: sessionResponse.id,
            userId,
            date: sesion.date
          });
        }
      }
      
      return sessionResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training_sessions', userId] });
      queryClient.invalidateQueries({ queryKey: ['session_exercises'] });
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

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, sesion, ejerciciosRealizados }: { 
      id: string, 
      sesion: Omit<SesionPreparacion, 'id'>,
      ejerciciosRealizados?: ExerciseRecord[]
    }) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      const data = await api.updateTrainingSession(id, {
        userId,
        date: sesion.date,
        sessionType: sesion.session_type,
        durationMinutes: sesion.duration_minutes,
        notes: sesion.notes,
        intensity: sesion.intensity,
        trainingCategory: 'physical_preparation'
      });

      // If exercises are provided, update them
      if (ejerciciosRealizados) {
        // Delete existing exercise records for this session
        await api.deleteExerciseRecordsBySession(id);

        // Insert new exercise records
        for (const ejercicio of ejerciciosRealizados) {
          if (ejercicio.exercise_id) {
            await api.createExerciseRecord({
              exerciseId: ejercicio.exercise_id,
              sets: ejercicio.sets,
              reps: ejercicio.reps,
              weightKg: ejercicio.weight_kg,
              durationMinutes: ejercicio.duration_minutes,
              restSeconds: ejercicio.rest_seconds,
              notes: ejercicio.notes,
              trainingSessionId: id,
              userId,
              date: sesion.date
            });
          }
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training_sessions', userId] });
      queryClient.invalidateQueries({ queryKey: ['session_exercises'] });
      toast({
        title: "Sesión actualizada",
        description: "La sesión ha sido actualizada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la sesión.",
        variant: "destructive",
      });
    }
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      // First delete all exercise records for this session
      await api.deleteExerciseRecordsBySession(id);
      
      // Then delete the training session
      await api.deleteTrainingSession(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training_sessions', userId] });
      toast({
        title: "Sesión eliminada",
        description: "La sesión ha sido eliminada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la sesión.",
        variant: "destructive",
      });
    }
  });



  return {
    sesiones,
    ejercicios,
    isLoading,
    createSessionMutation,
    updateSessionMutation,
    deleteSessionMutation
  };
};
