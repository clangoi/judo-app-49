import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Notification, NotificationSettings, InsertNotification, InsertNotificationSettings } from '@shared/schema';

const api = {
  // Obtener notificaciones del usuario
  getNotifications: async (userId: string): Promise<Notification[]> => {
    const response = await fetch(`/api/notifications/${userId}`);
    if (!response.ok) {
      throw new Error('Error al cargar notificaciones');
    }
    return response.json();
  },

  // Marcar notificación como leída
  markAsRead: async (notificationId: string): Promise<void> => {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error('Error al marcar notificación como leída');
    }
  },

  // Marcar todas las notificaciones como leídas
  markAllAsRead: async (userId: string): Promise<void> => {
    const response = await fetch(`/api/notifications/${userId}/read-all`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error('Error al marcar todas las notificaciones como leídas');
    }
  },

  // Crear nueva notificación
  createNotification: async (notification: InsertNotification): Promise<Notification> => {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });
    if (!response.ok) {
      throw new Error('Error al crear notificación');
    }
    return response.json();
  },

  // Obtener configuración de notificaciones del usuario
  getNotificationSettings: async (userId: string): Promise<NotificationSettings | null> => {
    const response = await fetch(`/api/notification-settings/${userId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No settings yet
      }
      throw new Error('Error al cargar configuración de notificaciones');
    }
    return response.json();
  },

  // Actualizar configuración de notificaciones
  updateNotificationSettings: async (userId: string, settings: Partial<InsertNotificationSettings>): Promise<NotificationSettings> => {
    const response = await fetch(`/api/notification-settings/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      throw new Error('Error al actualizar configuración de notificaciones');
    }
    return response.json();
  },

  // Crear configuración de notificaciones por defecto
  createNotificationSettings: async (settings: InsertNotificationSettings): Promise<NotificationSettings> => {
    const response = await fetch('/api/notification-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      throw new Error('Error al crear configuración de notificaciones');
    }
    return response.json();
  },
};

export const useNotifications = (userId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Obtener notificaciones
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => api.getNotifications(userId!),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Calcular notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Marcar como leída
  const markAsRead = useMutation({
    mutationFn: api.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo marcar la notificación como leída',
        variant: 'destructive',
      });
    },
  });

  // Marcar todas como leídas
  const markAllAsRead = useMutation({
    mutationFn: () => api.markAllAsRead(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      toast({
        title: 'Notificaciones marcadas',
        description: 'Todas las notificaciones han sido marcadas como leídas',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudieron marcar las notificaciones como leídas',
        variant: 'destructive',
      });
    },
  });

  // Crear notificación
  const createNotification = useMutation({
    mutationFn: api.createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo crear la notificación',
        variant: 'destructive',
      });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    createNotification,
  };
};

export const useNotificationSettings = (userId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Obtener configuración
  const { data: settings, isLoading } = useQuery({
    queryKey: ['notification-settings', userId],
    queryFn: () => api.getNotificationSettings(userId!),
    enabled: !!userId,
  });

  // Actualizar configuración
  const updateSettings = useMutation({
    mutationFn: (newSettings: Partial<InsertNotificationSettings>) => 
      api.updateNotificationSettings(userId!, newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings', userId] });
      toast({
        title: 'Configuración guardada',
        description: 'Las preferencias de notificaciones han sido actualizadas',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        variant: 'destructive',
      });
    },
  });

  // Crear configuración por defecto
  const createSettings = useMutation({
    mutationFn: api.createNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings', userId] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo crear la configuración de notificaciones',
        variant: 'destructive',
      });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings,
    createSettings,
  };
};