import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info, CheckCircle, Clock } from "lucide-react";

interface AthleteAlertsWidgetProps {
  config: any;
}

export const AthleteAlertsWidget = ({ config }: AthleteAlertsWidgetProps) => {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['/api/trainer/athlete-alerts']
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-gray-100 rounded animate-pulse">
            <div className="h-4 w-4 bg-gray-200 rounded-full" />
            <div className="flex-1 h-3 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Mock data until backend is implemented
  const mockAlerts = [
    {
      id: 1,
      type: 'warning',
      athlete: 'María García',
      message: 'No ha entrenado en 3 días',
      timestamp: '2 horas',
      priority: 'medium'
    },
    {
      id: 2,
      type: 'info',
      athlete: 'Carlos López',
      message: 'Próximo examen de cinturón',
      timestamp: '1 día',
      priority: 'low'
    },
    {
      id: 3,
      type: 'error',
      athlete: 'Ana Martínez',
      message: 'Posible lesión reportada',
      timestamp: '30 min',
      priority: 'high'
    },
    {
      id: 4,
      type: 'success',
      athlete: 'Diego Rodríguez',
      message: 'Meta semanal completada',
      timestamp: '1 hora',
      priority: 'low'
    }
  ];

  const alertsData = alerts || mockAlerts;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-3 w-3 text-yellow-600" />;
      case 'info':
        return <Info className="h-3 w-3 text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      default:
        return <Info className="h-3 w-3 text-gray-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Urgente</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-xs text-yellow-700 bg-yellow-50">Medio</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Bajo</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Alertas</span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {alertsData.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50 text-green-500" />
            <p className="text-sm">No hay alertas pendientes</p>
          </div>
        ) : (
          alertsData
            .sort((a: any, b: any) => {
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                     (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
            })
            .slice(0, config?.maxAlerts || 6)
            .map((alert: any) => (
              <div 
                key={alert.id} 
                className={`p-2 border rounded-lg ${getAlertColor(alert.type)} transition-colors hover:shadow-sm`}
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      {getAlertIcon(alert.type)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs">{alert.athlete}</span>
                          {getPriorityBadge(alert.priority)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Hace {alert.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {alertsData.length > (config?.maxAlerts || 6) && (
        <div className="pt-2 border-t">
          <button className="text-xs text-blue-600 hover:text-blue-700">
            Ver todas las alertas ({alertsData.length})
          </button>
        </div>
      )}
    </div>
  );
};