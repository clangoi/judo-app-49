
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
      white: 'bg-background text-foreground border-border',
      yellow: 'bg-primary/10 text-primary border-primary/30',
      orange: 'bg-primary/15 text-primary border-primary/30',
      green: 'bg-primary/20 text-primary border-primary/30',
      blue: 'bg-primary/25 text-primary border-primary/30',
      brown: 'bg-primary/30 text-primary border-primary/30',
      black: 'bg-foreground text-background border-foreground'
    };
    return colors[belt] || colors.white;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Tasa de Actividad */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Target className="h-4 w-4 text-primary" />
            Tasa de Actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Deportistas Activos</span>
              <span className="text-lg font-bold text-primary">{activityRate}%</span>
            </div>
            <Progress value={activityRate} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {groupStats.activeAthletes} de {groupStats.totalAthletes} deportistas entrenaron esta semana
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promedio de Entrenamientos */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Promedio del Grupo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
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
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Seguimiento Requerido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Deportistas Inactivos</span>
              <span className="text-lg font-bold text-destructive">{inactivityRate}%</span>
            </div>
            <Progress value={inactivityRate} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {groupStats.inactiveAthletes} deportistas necesitan seguimiento
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribución de Cinturones */}
      <Card className="md:col-span-2 lg:col-span-3 bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Trophy className="h-5 w-5 text-primary" />
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
