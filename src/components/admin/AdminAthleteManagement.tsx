
import { useState } from "react";
import { useAdminAthleteManagement } from "@/hooks/useAdminAthleteManagement";
import { AdminIndividualAthleteView } from "./AdminIndividualAthleteView";
import { TrainerGroupCard } from "./TrainerGroupCard";
import { ProfileSummaryStats } from "../gestion/ProfileSummaryStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, BarChart3 } from "lucide-react";

const AdminAthleteManagement = () => {
  const { athletesData, isLoading, getProfileStats, getTrainerStats } = useAdminAthleteManagement();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'overview' | 'individual'>('overview');

  const profileStats = getProfileStats(athletesData);
  const trainerStats = getTrainerStats(athletesData);
  const selectedAthlete = athletesData.find(a => a.id === selectedAthleteId);

  // Group athletes by trainer
  const athletesByTrainer = athletesData.reduce((acc, athlete) => {
    const trainerName = athlete.trainer?.full_name || 'Sin entrenador asignado';
    if (!acc[trainerName]) {
      acc[trainerName] = {
        trainer: athlete.trainer,
        athletes: []
      };
    }
    acc[trainerName].athletes.push(athlete);
    return acc;
  }, {} as Record<string, { trainer?: any; athletes: typeof athletesData }>);

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
      <Tabs value={currentView} onValueChange={(value) => {
        if (value === 'overview') {
          handleBackToOverview();
        }
        setCurrentView(value as 'overview' | 'individual');
      }}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Vista General
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Deportista Individual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deportistas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profileStats.totalAthletes}</div>
                <p className="text-xs text-muted-foreground">
                  En todo el sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entrenadores Activos</CardTitle>
                <Shield className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(trainerStats.trainerDistribution).filter(t => t !== 'Sin entrenador').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Con deportistas asignados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sin Asignar</CardTitle>
                <Users className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {trainerStats.trainerDistribution['Sin entrenador'] || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Deportistas sin entrenador
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas de Perfil */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfileSummaryStats profileStats={profileStats} />
            
            {/* Distribución por Entrenador */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Distribución por Entrenador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(trainerStats.trainerDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .map(([trainerName, count]) => (
                      <div key={trainerName} className="flex justify-between items-center">
                        <span className="text-sm">{trainerName}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grupos por Entrenador */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Deportistas por Entrenador</h3>
            <div className="grid grid-cols-1 gap-6">
              {Object.entries(athletesByTrainer).map(([trainerName, group]) => (
                <TrainerGroupCard
                  key={trainerName}
                  trainerName={trainerName}
                  trainer={group.trainer}
                  athletes={group.athletes}
                  onAthleteSelect={handleAthleteSelect}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="individual">
          <AdminIndividualAthleteView
            athleteId={selectedAthleteId || ''}
            athlete={selectedAthlete}
            onBack={handleBackToOverview}
            allAthletes={athletesData}
            onAthleteSelect={handleAthleteSelect}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAthleteManagement;
