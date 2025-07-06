
import { AthleteData, ActivityFilter } from "@/hooks/useAthleteManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AthleteCard } from "./AthleteCard";
import { SummaryFilters } from "./SummaryFilters";
import { GroupProgressCharts } from "./GroupProgressCharts";
import { AthletesSummaryStats } from "./AthletesSummaryStats";
import { Users, TrendingUp, Award, Activity } from "lucide-react";

interface AthletesSummaryViewProps {
  athletes: AthleteData[];
  groupStats: {
    totalAthletes: number;
    activeAthletes: number;
    averageWeeklySessions: number;
    beltDistribution: Record<string, number>;
    inactiveAthletes: number;
    moderateAthletes: number;
  };
  filters: ActivityFilter;
  onFiltersChange: (filters: ActivityFilter) => void;
  onAthleteSelect: (athleteId: string) => void;
  isLoading: boolean;
}

export const AthletesSummaryView = ({
  athletes,
  groupStats,
  filters,
  onFiltersChange,
  onAthleteSelect,
  isLoading
}: AthletesSummaryViewProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deportistas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupStats.totalAthletes}</div>
            <p className="text-xs text-muted-foreground">
              Asignados a tu cargo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deportistas Activos</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{groupStats.activeAthletes}</div>
            <p className="text-xs text-muted-foreground">
              Entrenaron esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{groupStats.averageWeeklySessions}</div>
            <p className="text-xs text-muted-foreground">
              Sesiones por deportista
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deportistas Inactivos</CardTitle>
            <Award className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{groupStats.inactiveAthletes}</div>
            <p className="text-xs text-muted-foreground">
              Requieren seguimiento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas Detalladas */}
      <AthletesSummaryStats groupStats={groupStats} />

      {/* Gráficos del Grupo */}
      <GroupProgressCharts athletes={athletes} />

      {/* Filtros */}
      <SummaryFilters 
        filters={filters} 
        onFiltersChange={onFiltersChange}
        totalAthletes={athletes.length}
      />

      {/* Lista de Deportistas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Deportistas ({athletes.length})
        </h3>
        
        {athletes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">
                No se encontraron deportistas con los filtros aplicados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {athletes.map((athlete) => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                onClick={() => onAthleteSelect(athlete.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
