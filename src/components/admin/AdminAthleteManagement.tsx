
import { useState } from "react";
import { useAdminAthleteManagement } from "@/hooks/useAdminAthleteManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrainerGroupCard } from "./TrainerGroupCard";
import { AdminIndividualAthleteView } from "./AdminIndividualAthleteView";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, UserCheck, TrendingUp, AlertTriangle } from "lucide-react";
import { Loader2 } from "lucide-react";

export const AdminAthleteManagement = () => {
  const { trainersWithAthletes, isLoading, getGlobalStats } = useAdminAthleteManagement();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'overview' | 'individual'>('overview');

  const globalStats = getGlobalStats();
  const selectedAthlete = trainersWithAthletes
    .flatMap(t => t.athletes)
    .find(a => a.id === selectedAthleteId);

  const handleAthleteSelect = (athleteId: string) => {
    setSelectedAthleteId(athleteId);
    setCurrentView('individual');
  };

  const handleBackToOverview = () => {
    setSelectedAthleteId(null);
    setCurrentView('overview');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando datos de deportistas...</span>
      </div>
    );
  }

  if (currentView === 'individual' && selectedAthlete) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBackToOverview}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Resumen
          </Button>
        </div>
        
        <AdminIndividualAthleteView 
          athlete={selectedAthlete}
          onBack={handleBackToOverview}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas Globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entrenadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalTrainers}</div>
            <p className="text-xs text-muted-foreground">
              En el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deportistas</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{globalStats.totalAthletes}</div>
            <p className="text-xs text-muted-foreground">
              Asignados a entrenadores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deportistas Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{globalStats.totalActiveAthletes}</div>
            <p className="text-xs text-muted-foreground">
              Entrenaron esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Global</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{globalStats.globalAverageWeeklySessions}</div>
            <p className="text-xs text-muted-foreground">
              Sesiones por entrenador
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Entrenadores con sus Deportistas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Entrenadores y sus Deportistas ({trainersWithAthletes.length})
        </h3>
        
        {trainersWithAthletes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                No se encontraron entrenadores con deportistas asignados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {trainersWithAthletes.map((trainer) => (
              <TrainerGroupCard
                key={trainer.trainer_id}
                trainer={trainer}
                onAthleteSelect={handleAthleteSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
