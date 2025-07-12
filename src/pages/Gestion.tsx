
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAthleteManagement, ActivityFilter } from "@/hooks/useAthleteManagement";
import NavHeader from "@/components/NavHeader";
import { AthletesSummaryView } from "@/components/gestion/AthletesSummaryView";
import { IndividualAthleteView } from "@/components/gestion/IndividualAthleteView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Gestion = () => {
  const { user } = useAuth();
  const { currentUserRole } = useUserRoles(user?.id);
  const { athletesData, isLoading, filterAthletes, getGroupStats, getProfileStats } = useAthleteManagement(user?.id || '');
  const navigate = useNavigate();
  
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'summary' | 'individual'>('summary');
  const [filters, setFilters] = useState<ActivityFilter>({
    activity: 'all',
    belt: 'all',
    trainingType: 'all',
    period: 'month',
    search: ''
  });

  // Verificar permisos
  if (currentUserRole !== 'entrenador' && currentUserRole !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader title="Acceso Denegado" />
        <div className="max-w-4xl mx-auto p-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Acceso Restringido
              </h2>
              <p className="text-muted-foreground">
                Esta sección está disponible solo para entrenadores.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filteredAthletes = filterAthletes(athletesData, filters);
  const groupStats = getGroupStats(filteredAthletes);
  const profileStats = getProfileStats(filteredAthletes);
  const selectedAthlete = athletesData.find(a => a.id === selectedAthleteId);

  const handleAthleteSelect = (athleteId: string) => {
    setSelectedAthleteId(athleteId);
    setCurrentView('individual');
  };

  const handleBackToSummary = () => {
    setSelectedAthleteId(null);
    setCurrentView('summary');
  };

  const handleAdminPanel = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader 
        title={currentView === 'summary' ? 'Gestión de Deportistas' : `Deportista: ${selectedAthlete?.full_name || 'Selección'}`}
        subtitle={currentView === 'summary' 
          ? `${groupStats.totalAthletes} deportistas asignados` 
          : 'Datos detallados del deportista'
        }
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Botones de navegación */}
        <div className="flex items-center justify-between mb-6">
          {currentView === 'individual' && (
            <Button
              variant="outline"
              onClick={handleBackToSummary}
              className="flex items-center gap-2 border-border text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Resumen
            </Button>
          )}
          
          {currentView === 'summary' && <div></div>}
          
          {/* Solo mostrar botón de Admin si el usuario es administrador */}
          {currentUserRole === 'admin' && (
            <Button
              variant="outline"
              onClick={handleAdminPanel}
              className="flex items-center gap-2 border-border text-foreground hover:bg-muted"
            >
              <Shield className="h-4 w-4" />
              Panel de Administración
            </Button>
          )}
        </div>

        <Tabs value={currentView} onValueChange={(value) => {
          if (value === 'summary') {
            handleBackToSummary();
          }
          setCurrentView(value as 'summary' | 'individual');
        }}>
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted">
            <TabsTrigger value="summary" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4" />
              Resumen General
            </TabsTrigger>
            <TabsTrigger 
              value="individual"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Deportista Individual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-6">
            <AthletesSummaryView
              athletes={filteredAthletes}
              groupStats={groupStats}
              profileStats={profileStats}
              filters={filters}
              onFiltersChange={setFilters}
              onAthleteSelect={handleAthleteSelect}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="individual" className="mt-6">
            <IndividualAthleteView
              athleteId={selectedAthleteId || ''}
              athlete={selectedAthlete}
              onBack={handleBackToSummary}
              allAthletes={filteredAthletes}
              onAthleteSelect={handleAthleteSelect}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Gestion;
