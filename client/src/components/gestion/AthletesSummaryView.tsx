
import { AthleteData, ActivityFilter } from "@/hooks/useAthleteManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AthleteCard } from "./AthleteCard";
import { SummaryFilters } from "./SummaryFilters";
import { GroupProgressCharts } from "./GroupProgressCharts";
import { AthletesSummaryStats } from "./AthletesSummaryStats";
import { ProfileSummaryStats } from "./ProfileSummaryStats";
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
  profileStats: {
    totalAthletes: number;
    genderDistribution: { male: number; female: number; unspecified: number };
    clubDistribution: Record<string, number>;
    injuryStats: { withInjuries: number; withoutInjuries: number };
    categoryDistribution: Record<string, number>;
  };
  filters: ActivityFilter;
  onFiltersChange: (filters: ActivityFilter) => void;
  onAthleteSelect: (athleteId: string) => void;
  isLoading: boolean;
}

export const AthletesSummaryView = ({
  athletes,
  groupStats,
  profileStats,
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
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
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
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Deportistas</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{groupStats.totalAthletes}</div>
            <p className="text-xs text-muted-foreground">
              Asignados a tu cargo
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Deportistas Activos</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{groupStats.activeAthletes}</div>
            <p className="text-xs text-muted-foreground">
              Entrenaron esta semana
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Promedio Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{groupStats.averageWeeklySessions}</div>
            <p className="text-xs text-muted-foreground">
              Sesiones por deportista
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Deportistas Inactivos</CardTitle>
            <Award className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{groupStats.inactiveAthletes}</div>
            <p className="text-xs text-muted-foreground">
              Requieren seguimiento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas Detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <AthletesSummaryStats groupStats={groupStats} />
        </div>
        <div>
          <ProfileSummaryStats profileStats={profileStats} />
        </div>
      </div>

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
        <h3 className="text-lg font-semibold text-foreground">
          Deportistas ({athletes.length})
        </h3>
        
        {athletes.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
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
