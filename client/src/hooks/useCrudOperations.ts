/**
 * Generic CRUD hook that eliminates massive duplication across all entity hooks
 * Provides standardized create, read, update, delete operations with error handling
 */
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface CrudConfig<T, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  entityName: string; // For query keys and toast messages
  queryKey: (userId?: string) => (string | undefined)[];
  api: {
    getAll: (userId: string) => Promise<{ data: T[] }>;
    create: (data: CreateInput) => Promise<{ data: T }>;
    update: (id: string, data: UpdateInput) => Promise<{ data: T }>;
    delete: (id: string) => Promise<{ data: void }>;
  };
  transform?: {
    fromApi?: (data: any) => T;
    toCreateApi?: (data: CreateInput) => any;
    toUpdateApi?: (data: UpdateInput) => any;
  };
  messages?: {
    created?: string;
    updated?: string;
    deleted?: string;
    createError?: string;
    updateError?: string;
    deleteError?: string;
  };
}

export const useCrudOperations = <T, CreateInput = Partial<T>, UpdateInput = Partial<T>>(
  config: CrudConfig<T, CreateInput, UpdateInput>
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = user?.id;

  // Default messages
  const messages = {
    created: `${config.entityName} creado exitosamente`,
    updated: `${config.entityName} actualizado exitosamente`,
    deleted: `${config.entityName} eliminado exitosamente`,
    createError: `No se pudo crear ${config.entityName}`,
    updateError: `No se pudo actualizar ${config.entityName}`,
    deleteError: `No se pudo eliminar ${config.entityName}`,
    ...config.messages
  };

  // Generic query
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: config.queryKey(userId),
    queryFn: async () => {
      if (!userId) return [];
      const response = await config.api.getAll(userId);
      const data = response.data || response; // Handle both { data: T } and T responses
      
      if (config.transform?.fromApi) {
        return Array.isArray(data) ? data.map(config.transform.fromApi) : [data].map(config.transform.fromApi);
      }
      return Array.isArray(data) ? data : [data];
    },
    enabled: !!userId,
  });

  // Generic create mutation
  const createMutation = useMutation({
    mutationFn: async (itemData: CreateInput) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      const transformedData = config.transform?.toCreateApi 
        ? config.transform.toCreateApi(itemData)
        : itemData;
        
      const response = await config.api.create(transformedData);
      return response.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey() });
      toast({
        title: "Éxito",
        description: messages.created,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || messages.createError,
        variant: "destructive",
      });
    },
  });

  // Generic update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateInput }) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      const transformedData = config.transform?.toUpdateApi 
        ? config.transform.toUpdateApi(data)
        : data;
        
      const response = await config.api.update(id, transformedData);
      return response.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey() });
      toast({
        title: "Éxito",
        description: messages.updated,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || messages.updateError,
        variant: "destructive",
      });
    },
  });

  // Generic delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error('Usuario no autenticado');
      const response = await config.api.delete(id);
      return response.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey() });
      toast({
        title: "Éxito",
        description: messages.deleted,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || messages.deleteError,
        variant: "destructive",
      });
    },
  });

  return {
    items,
    isLoading,
    error,
    createMutation,
    updateMutation,
    deleteMutation,
    // Helper methods
    refresh: () => queryClient.invalidateQueries({ queryKey: config.queryKey() }),
    isAuthenticated: !!userId,
  };
};

/**
 * Specialized hook for entities that need additional queries (like exercises for training sessions)
 */
export const useCrudWithRelated = <T, CreateInput = Partial<T>, UpdateInput = Partial<T>, Related = any>(
  config: CrudConfig<T, CreateInput, UpdateInput> & {
    relatedConfig?: {
      queryKey: (userId?: string) => (string | undefined)[];
      api: (userId: string) => Promise<{ data: Related[] }>;
      transform?: (data: any) => Related;
    };
  }
) => {
  const crudResult = useCrudOperations(config);
  const { user } = useAuth();
  const userId = user?.id;

  const { data: relatedItems = [] } = useQuery({
    queryKey: config.relatedConfig?.queryKey(userId) || [],
    queryFn: async () => {
      if (!userId || !config.relatedConfig) return [];
      const response = await config.relatedConfig.api(userId);
      const data = response.data || response;
      
      if (config.relatedConfig.transform) {
        return Array.isArray(data) ? data.map(config.relatedConfig.transform) : [data].map(config.relatedConfig.transform);
      }
      return Array.isArray(data) ? data : [data];
    },
    enabled: !!userId && !!config.relatedConfig,
  });

  return {
    ...crudResult,
    relatedItems,
  };
};