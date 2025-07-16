import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export interface NotificationAlarm {
  id: string;
  userId: string;
  title: string;
  category: 'training' | 'weight' | 'nutrition';
  time: string; // HH:MM format
  days: string[]; // ['monday', 'tuesday', etc.]
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationAlarm {
  userId: string;
  title: string;
  category: 'training' | 'weight' | 'nutrition';
  time: string;
  days: string[];
  isActive?: boolean;
}

export const useNotificationAlarms = (userId: string) => {
  const queryClient = useQueryClient();

  // Fetch alarms
  const {
    data: alarms = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/notification-alarms', userId],
    queryFn: async (): Promise<NotificationAlarm[]> => {
      const response = await fetch(`/api/notification-alarms/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notification alarms');
      }
      return response.json();
    },
    enabled: !!userId,
  });

  // Create alarm
  const createAlarm = useMutation({
    mutationFn: async (newAlarm: CreateNotificationAlarm): Promise<NotificationAlarm> => {
      const response = await fetch('/api/notification-alarms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAlarm),
      });

      if (!response.ok) {
        throw new Error('Failed to create notification alarm');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-alarms', userId] });
      toast({
        title: "Alarma creada",
        description: "La alarma de notificación se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la alarma de notificación.",
        variant: "destructive",
      });
    },
  });

  // Update alarm
  const updateAlarm = useMutation({
    mutationFn: async ({ alarmId, ...updateData }: { alarmId: string } & Partial<CreateNotificationAlarm>): Promise<NotificationAlarm> => {
      const response = await fetch(`/api/notification-alarms/${alarmId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update notification alarm');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-alarms', userId] });
      toast({
        title: "Alarma actualizada",
        description: "La alarma de notificación se ha actualizado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la alarma de notificación.",
        variant: "destructive",
      });
    },
  });

  // Delete alarm
  const deleteAlarm = useMutation({
    mutationFn: async (alarmId: string): Promise<void> => {
      const response = await fetch(`/api/notification-alarms/${alarmId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification alarm');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-alarms', userId] });
      toast({
        title: "Alarma eliminada",
        description: "La alarma de notificación se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la alarma de notificación.",
        variant: "destructive",
      });
    },
  });

  // Toggle alarm active state
  const toggleAlarm = useMutation({
    mutationFn: async ({ alarmId, isActive }: { alarmId: string; isActive: boolean }): Promise<NotificationAlarm> => {
      const response = await fetch(`/api/notification-alarms/${alarmId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle notification alarm');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-alarms', userId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la alarma.",
        variant: "destructive",
      });
    },
  });

  return {
    alarms,
    isLoading,
    error,
    createAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
  };
};