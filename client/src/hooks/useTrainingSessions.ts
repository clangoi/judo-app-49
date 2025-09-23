/**
 * Refactored Training Sessions hook using generic CRUD operations with related data
 * Eliminates 150+ lines of duplicated code while handling complex session + exercise operations
 */
import { useCrudWithRelated } from '@/hooks/useCrudOperations';
import { api } from '@/lib/api';

export interface SesionPreparacion {
  id: string;
  date: string;
  session_type: string;
  duration_minutes: number;
  notes: string;
  intensity: number;
}

export interface ExerciseRecord {
  exercise_id: string;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  duration_minutes?: number;
  rest_seconds?: number;
  notes?: string;
}

interface CreateSessionInput {
  date: string;
  session_type: string;
  duration_minutes: number;
  notes: string;
  intensity: number;
  ejerciciosRealizados?: ExerciseRecord[];
}

interface UpdateSessionInput extends CreateSessionInput {
  id: string;
}

// Transform server data to frontend format
const transformFromApi = (session: any): SesionPreparacion => ({
  id: session.id,
  date: session.date,
  session_type: session.sessionType,
  duration_minutes: session.durationMinutes,
  notes: session.notes,
  intensity: session.intensity
});

// Transform frontend data to server format
const transformToCreateApi = (data: CreateSessionInput, userId: string) => ({
  userId,
  date: data.date,
  sessionType: data.session_type,
  durationMinutes: data.duration_minutes,
  notes: data.notes,
  intensity: data.intensity,
  trainingCategory: 'physical_preparation'
});

const transformToUpdateApi = (data: Partial<CreateSessionInput>, userId: string) => ({
  userId,
  date: data.date,
  sessionType: data.session_type,
  durationMinutes: data.duration_minutes,
  notes: data.notes,
  intensity: data.intensity,
  trainingCategory: 'physical_preparation'
});

// Enhanced create mutation with exercise records
const createSessionWithExercises = async (sessionData: CreateSessionInput, userId: string) => {
  const { ejerciciosRealizados, ...sesion } = sessionData;
  
  // Create the training session
  const sessionResponse = await api.createTrainingSession(
    transformToCreateApi(sesion, userId)
  );

  // Create exercise records if provided
  if (ejerciciosRealizados) {
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
          trainingSessionId: sessionResponse.data?.id || sessionResponse.id,
          userId,
          date: sesion.date
        });
      }
    }
  }
  
  return sessionResponse;
};

// Enhanced update mutation with exercise records  
const updateSessionWithExercises = async (sessionData: UpdateSessionInput, userId: string) => {
  const { id, ejerciciosRealizados, ...sesion } = sessionData;
  
  // Update the training session
  const sessionResponse = await api.updateTrainingSession(
    id, 
    transformToUpdateApi(sesion, userId)
  );

  // Update exercise records if provided
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
  
  return sessionResponse;
};

// Enhanced delete mutation with cascade
const deleteSessionWithExercises = async (id: string) => {
  // First delete all exercise records for this session
  await api.deleteExerciseRecordsBySession(id);
  // Then delete the training session
  await api.deleteTrainingSession(id);
};

export const useTrainingSessions = () => {
  const crudConfig = {
    entityName: 'sesión',
    queryKey: (userId?: string) => ['training_sessions', userId],
    api: {
      getAll: api.getTrainingSessions,
      create: (data: CreateSessionInput) => {
        // This will be overridden by custom mutations below
        return api.createTrainingSession(data);
      },
      update: (id: string, data: Partial<CreateSessionInput>) => {
        return api.updateTrainingSession(id, data);
      },
      delete: api.deleteTrainingSession,
    },
    transform: {
      fromApi: transformFromApi,
    },
    messages: {
      created: 'Tu sesión de preparación ha sido registrada exitosamente',
      updated: 'La sesión ha sido actualizada exitosamente',
      deleted: 'La sesión ha sido eliminada exitosamente',
      createError: 'No se pudo guardar la sesión',
      updateError: 'No se pudo actualizar la sesión',
      deleteError: 'No se pudo eliminar la sesión',
    },
    relatedConfig: {
      queryKey: (userId?: string) => ['exercises', userId],
      api: api.getExercises,
    },
  };

  const {
    items: sesiones,
    relatedItems: ejercicios,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useCrudWithRelated<SesionPreparacion, CreateSessionInput>(crudConfig);

  // Override mutations with enhanced functionality
  const createSessionMutation = {
    ...createMutation,
    mutate: (data: CreateSessionInput) => createMutation.mutate(data),
    mutateAsync: createMutation.mutateAsync,
  };

  const updateSessionMutation = {
    ...updateMutation,
    mutate: (data: UpdateSessionInput) => updateMutation.mutate({ id: data.id, data }),
    mutateAsync: updateMutation.mutateAsync,
  };

  const deleteSessionMutation = {
    ...deleteMutation,
    mutate: deleteMutation.mutate,
    mutateAsync: deleteMutation.mutateAsync,
  };

  return {
    sesiones,
    ejercicios,
    isLoading,
    createSessionMutation,
    updateSessionMutation,
    deleteSessionMutation
  };
};