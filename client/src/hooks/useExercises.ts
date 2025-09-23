/**
 * Refactored Exercise hook using generic CRUD operations
 * Eliminates 50+ lines of duplicated code
 */
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { api } from '@/lib/api';

interface Exercise {
  id: string;
  name: string;
  userId: string;
  createdAt?: Date;
}

interface CreateExerciseInput {
  name: string;
}

export const useExercises = () => {
  const crudConfig = {
    entityName: 'ejercicio',
    queryKey: (userId?: string) => ['exercises', userId],
    api: {
      getAll: api.getExercises,
      create: (data: CreateExerciseInput) => api.createExercise(data),
      update: (id: string, data: Partial<Exercise>) => api.patch(`/api/exercises/${id}`, data),
      delete: api.deleteExercise,
    },
    transform: {
      toCreateApi: (data: CreateExerciseInput) => ({
        name: data.name,
        // userId is automatically added by the generic hook
      }),
    },
    messages: {
      created: 'El ejercicio ha sido creado exitosamente',
      deleted: 'El ejercicio ha sido eliminado exitosamente',
      createError: 'No se pudo crear el ejercicio',
      deleteError: 'No se pudo eliminar el ejercicio',
    },
  };

  const {
    items: exercises,
    isLoading,
    createMutation: createExerciseMutation,
    deleteMutation: deleteExerciseMutation,
  } = useCrudOperations<Exercise, CreateExerciseInput>(crudConfig);

  return {
    exercises,
    isLoading,
    createExerciseMutation,
    deleteExerciseMutation,
  };
};