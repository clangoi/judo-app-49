import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";

interface AthleteOverviewWidgetProps {
  config: any;
}

export const AthleteOverviewWidget = ({ config }: AthleteOverviewWidgetProps) => {
  const { data: athletes = [], isLoading } = useQuery({
    queryKey: ['/api/trainer/assigned-athletes']
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const activeAthletes = athletes.filter((a: any) => a.activityStatus === 'active');
  const inactiveAthletes = athletes.filter((a: any) => a.activityStatus === 'inactive');
  const moderateAthletes = athletes.filter((a: any) => a.activityStatus === 'moderate');

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'moderate':
        return <Minus className="h-3 w-3 text-yellow-600" />;
      case 'inactive':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'moderate':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'inactive':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-green-50 rounded">
          <div className="text-lg font-bold text-green-600">{activeAthletes.length}</div>
          <div className="text-xs text-green-700">Activos</div>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded">
          <div className="text-lg font-bold text-yellow-600">{moderateAthletes.length}</div>
          <div className="text-xs text-yellow-700">Moderados</div>
        </div>
        <div className="text-center p-2 bg-red-50 rounded">
          <div className="text-lg font-bold text-red-600">{inactiveAthletes.length}</div>
          <div className="text-xs text-red-700">Inactivos</div>
        </div>
      </div>

      {/* Athletes List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {athletes.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tienes deportistas asignados</p>
          </div>
        ) : (
          athletes.slice(0, config?.maxVisible || 5).map((athlete: any) => (
            <div key={athlete.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {getActivityIcon(athlete.activityStatus)}
                  <span className="font-medium text-sm">{athlete.full_name}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getActivityColor(athlete.activityStatus)}`}
                >
                  {athlete.weeklySessionsCount || 0} sesiones
                </Badge>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {athletes.length > (config?.maxVisible || 5) && (
        <Button variant="outline" size="sm" className="w-full">
          Ver todos los {athletes.length} deportistas
        </Button>
      )}
    </div>
  );
};