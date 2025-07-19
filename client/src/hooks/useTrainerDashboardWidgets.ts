import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import type { TrainerDashboardWidget, InsertTrainerDashboardWidget } from "@shared/schema";

interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface WidgetConfig {
  [key: string]: any;
}

export const useTrainerDashboardWidgets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const trainerId = user?.id;

  // Fetch trainer widgets
  const {
    data: widgets = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/trainer/dashboard-widgets', trainerId],
    enabled: !!trainerId
  });

  // Add new widget
  const addWidgetMutation = useMutation({
    mutationFn: async (widgetData: Omit<InsertTrainerDashboardWidget, 'trainerId'>) => {
      const response = await fetch('/api/trainer/dashboard-widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': trainerId!
        },
        body: JSON.stringify({
          ...widgetData,
          trainerId: trainerId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add widget');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/trainer/dashboard-widgets', trainerId]
      });
    }
  });

  // Update widget position
  const updatePositionMutation = useMutation({
    mutationFn: async ({ widgetId, position }: { widgetId: string; position: WidgetPosition }) => {
      const response = await fetch(`/api/trainer/dashboard-widgets/${widgetId}/position`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': trainerId!
        },
        body: JSON.stringify({ position })
      });

      if (!response.ok) {
        throw new Error('Failed to update widget position');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/trainer/dashboard-widgets', trainerId]
      });
    }
  });

  // Update widget config
  const updateConfigMutation = useMutation({
    mutationFn: async ({ widgetId, config }: { widgetId: string; config: WidgetConfig }) => {
      const response = await fetch(`/api/trainer/dashboard-widgets/${widgetId}/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': trainerId!
        },
        body: JSON.stringify({ config })
      });

      if (!response.ok) {
        throw new Error('Failed to update widget config');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/trainer/dashboard-widgets', trainerId]
      });
    }
  });

  // Remove widget
  const removeWidgetMutation = useMutation({
    mutationFn: async (widgetId: string) => {
      const response = await fetch(`/api/trainer/dashboard-widgets/${widgetId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': trainerId!
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove widget');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/trainer/dashboard-widgets', trainerId]
      });
    }
  });

  // Toggle widget visibility
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ widgetId, isVisible }: { widgetId: string; isVisible: boolean }) => {
      const response = await fetch(`/api/trainer/dashboard-widgets/${widgetId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': trainerId!
        },
        body: JSON.stringify({ isVisible })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle widget visibility');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/trainer/dashboard-widgets', trainerId]
      });
    }
  });

  // Get available widget types
  const getAvailableWidgetTypes = () => {
    return [
      {
        type: 'athlete_overview',
        name: 'Resumen de Deportistas',
        description: 'Vista general de todos tus deportistas asignados',
        icon: 'Users',
        defaultSize: { w: 6, h: 4 }
      },
      {
        type: 'session_stats',
        name: 'Estadísticas de Sesiones',
        description: 'Métricas de entrenamientos y sesiones',
        icon: 'BarChart3',
        defaultSize: { w: 4, h: 3 }
      },
      {
        type: 'recent_activities',
        name: 'Actividades Recientes',
        description: 'Últimas actividades de tus deportistas',
        icon: 'Activity',
        defaultSize: { w: 4, h: 4 }
      },
      {
        type: 'performance_charts',
        name: 'Gráficos de Rendimiento',
        description: 'Visualización del progreso de deportistas',
        icon: 'TrendingUp',
        defaultSize: { w: 6, h: 4 }
      },
      {
        type: 'upcoming_sessions',
        name: 'Próximas Sesiones',
        description: 'Calendario de entrenamientos programados',
        icon: 'Calendar',
        defaultSize: { w: 4, h: 3 }
      },
      {
        type: 'athlete_alerts',
        name: 'Alertas de Deportistas',
        description: 'Notificaciones importantes sobre deportistas',
        icon: 'AlertTriangle',
        defaultSize: { w: 4, h: 3 }
      }
    ];
  };

  return {
    widgets,
    isLoading,
    error,
    
    // Actions
    addWidget: addWidgetMutation.mutate,
    updateWidgetPosition: updatePositionMutation.mutate,
    updateWidgetConfig: updateConfigMutation.mutate,
    removeWidget: removeWidgetMutation.mutate,
    toggleWidgetVisibility: toggleVisibilityMutation.mutate,
    
    // Widget types
    availableWidgetTypes: getAvailableWidgetTypes(),
    
    // Loading states
    isAddingWidget: addWidgetMutation.isPending,
    isUpdatingPosition: updatePositionMutation.isPending,
    isUpdatingConfig: updateConfigMutation.isPending,
    isRemovingWidget: removeWidgetMutation.isPending,
    isTogglingVisibility: toggleVisibilityMutation.isPending
  };
};