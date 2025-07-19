import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Award, Users } from "lucide-react";

interface SessionStatsWidgetProps {
  config: any;
}

export const SessionStatsWidget = ({ config }: SessionStatsWidgetProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/trainer/session-stats']
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      </div>
    );
  }

  // Mock data until backend is implemented
  const mockStats = {
    weeklySessions: 24,
    totalAthletes: 8,
    averageAttendance: 85,
    topPerformer: "María García"
  };

  const statsData = stats || mockStats;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600">{statsData.weeklySessions}</div>
          <div className="text-xs text-blue-700">Sesiones esta semana</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Users className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-xl font-bold text-green-600">{statsData.totalAthletes}</div>
          <div className="text-xs text-green-700">Deportistas activos</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Asistencia promedio:</span>
          <Badge variant="outline" className="text-green-700 bg-green-50">
            {statsData.averageAttendance}%
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Mejor rendimiento:</span>
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3 text-yellow-600" />
            <span className="text-sm font-medium">{statsData.topPerformer}</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t">
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-3 w-3" />
          <span className="text-xs">+15% vs semana anterior</span>
        </div>
      </div>
    </div>
  );
};