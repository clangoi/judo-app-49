
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp, AlertTriangle } from "lucide-react";

interface AthletesSummaryStatsProps {
  groupStats: {
    totalAthletes: number;
    activeAthletes: number;
    averageWeeklySessions: number;
    beltDistribution: Record<string, number>;
    inactiveAthletes: number;
    moderateAthletes: number;
  };
}

export const AthletesSummaryStats = ({ groupStats }: AthletesSummaryStatsProps) => {
  const activityRate = Math.round((groupStats.activeAthletes / groupStats.totalAthletes) * 100);
  const inactivityRate = Math.round((groupStats.inactiveAthletes / groupStats.totalAthletes) * 100);

  const getBeltLabel = (belt: string) => {
    const labels: Record<string, string> = {
      white: 'Blanco',
      yellow: 'Amarillo',
      orange: 'Naranja',
      green: 'Verde',
      blue: 'Azul',
      brown: 'Marrón',
      black: 'Negro'
    };
    return labels[belt] || belt;
  };

  const getBeltColor = (belt: string) => {
    const colors: Record<string, string> = {
      white: 'bg-white text-gray-800 border-gray-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      brown: 'bg-amber-100 text-amber-800 border-amber-300',
      black: 'bg-gray-800 text-white border-gray-700'
    };
    return colors[belt] || colors.white;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Tasa de Actividad */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-green-600" />
            Tasa de Actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Deportistas Activos</span>
              <span className="text-lg font-bold text-green-600">{activityRate}%</span>
            </div>
            <Progress value={activityRate} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {groupStats.activeAthletes} de {groupStats.totalAthletes} deportistas entrenaron esta semana
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promedio de Entrenamientos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Promedio del Grupo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {groupStats.averageWeeklySessions}
              </div>
              <div className="text-sm text-muted-foreground">
                sesiones por semana
              </div>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Promedio de entrenamientos semanales por deportista
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerta de Inactividad */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            Seguimiento Requerido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Deportistas Inactivos</span>
              <span className="text-lg font-bold text-red-600">{inactivityRate}%</span>
            </div>
            <Progress value={inactivityRate} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {groupStats.inactiveAthletes} deportistas necesitan seguimiento
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribución de Cinturones */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Distribución de Cinturones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(groupStats.beltDistribution)
              .sort(([a], [b]) => {
                const order = ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black'];
                return order.indexOf(a) - order.indexOf(b);
              })
              .map(([belt, count]) => (
                <Badge
                  key={belt}
                  className={`${getBeltColor(belt)} px-3 py-1 text-sm font-medium`}
                >
                  {getBeltLabel(belt)}: {count}
                </Badge>
              ))}
          </div>
          
          {Object.keys(groupStats.beltDistribution).length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              No hay datos de cinturones disponibles
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
