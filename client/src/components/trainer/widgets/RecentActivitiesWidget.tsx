import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, User, Calendar } from "lucide-react";

interface RecentActivitiesWidgetProps {
  config: any;
}

export const RecentActivitiesWidget = ({ config }: RecentActivitiesWidgetProps) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/trainer/recent-activities']
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Mock data until backend is implemented
  const mockActivities = [
    {
      id: 1,
      type: 'training_session',
      athlete: 'María García',
      action: 'Completó sesión de Judo',
      timestamp: '2 horas',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'technique',
      athlete: 'Carlos López',
      action: 'Aprendió nueva técnica',
      timestamp: '4 horas',
      icon: User,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'weight_entry',
      athlete: 'Ana Martínez',
      action: 'Registró peso: 65kg',
      timestamp: '6 horas',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'achievement',
      athlete: 'Diego Rodríguez',
      action: 'Desbloqueó logro',
      timestamp: '1 día',
      icon: Activity,
      color: 'text-yellow-600'
    }
  ];

  const activitiesData = activities || mockActivities;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Últimas actividades</span>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activitiesData.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay actividades recientes</p>
          </div>
        ) : (
          activitiesData.slice(0, config?.maxActivities || 10).map((activity: any) => {
            const IconComponent = activity.icon;
            
            return (
              <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-1.5 rounded-full bg-gray-100 ${activity.color}`}>
                  <IconComponent className="h-3 w-3" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{activity.athlete}</span>
                    <Badge variant="outline" className="text-xs">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.action}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Hace {activity.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activitiesData.length > (config?.maxActivities || 10) && (
        <div className="pt-2 border-t">
          <button className="text-xs text-blue-600 hover:text-blue-700">
            Ver todas las actividades
          </button>
        </div>
      )}
    </div>
  );
};