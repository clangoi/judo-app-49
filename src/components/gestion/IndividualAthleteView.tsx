
import { AthleteData } from "@/hooks/useAthleteManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Weight, Calendar, Trophy, Target, Swords } from "lucide-react";
import { AthleteCard } from "./AthleteCard";

interface IndividualAthleteViewProps {
  athleteId: string;
  athlete: AthleteData;
  onBack: () => void;
  allAthletes?: AthleteData[];
  onAthleteSelect?: (athleteId: string) => void;
}

export const IndividualAthleteView = ({ 
  athleteId, 
  athlete, 
  onBack, 
  allAthletes = [], 
  onAthleteSelect 
}: IndividualAthleteViewProps) => {
  const getActivityColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'moderate':
        return 'Moderado';
      case 'inactive':
        return 'Inactivo';
      default:
        return 'Desconocido';
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Si no hay athleteId o athlete, mostrar todas las tarjetas de deportistas
  if (!athleteId || !athlete) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Selecciona un Deportista</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Elige un deportista para ver sus datos detallados.
            </p>
            
            {allAthletes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No hay deportistas disponibles.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allAthletes.map((athleteItem) => (
                  <AthleteCard
                    key={athleteItem.id}
                    athlete={athleteItem}
                    onClick={() => onAthleteSelect?.(athleteItem.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tarjeta del Deportista Seleccionado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <AthleteCard
          athlete={athlete}
          onClick={() => {}}
          isSelected={true}
        />
      </div>

      {/* Header del Deportista */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{athlete.full_name}</h2>
                <p className="text-muted-foreground">{athlete.email}</p>
                <p className="text-sm text-muted-foreground">{athlete.club_name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={getActivityColor(athlete.activityStatus)}>
                {getActivityLabel(athlete.activityStatus)}
              </Badge>
              <Badge className={getBeltColor(athlete.current_belt)}>
                Cinturón {athlete.current_belt}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{athlete.weeklySessionsCount}</div>
                <div className="text-xs text-muted-foreground">Sesiones/semana</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{athlete.totalTechniques}</div>
                <div className="text-xs text-muted-foreground">Técnicas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{athlete.totalTacticalNotes}</div>
                <div className="text-xs text-muted-foreground">Notas Tácticas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {athlete.lastWeightEntry ? `${athlete.lastWeightEntry.weight} kg` : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">Último peso</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pestañas de Datos Detallados */}
      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="peso">Peso</TabsTrigger>
          <TabsTrigger value="entrenamientos">Entrenamientos</TabsTrigger>
          <TabsTrigger value="tecnicas">Técnicas</TabsTrigger>
          <TabsTrigger value="tacticas">Tácticas</TabsTrigger>
          <TabsTrigger value="randori">Randori</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {athlete.lastWeightEntry && (
                <div>
                  <h4 className="font-semibold mb-2">Último Registro de Peso</h4>
                  <p>
                    <strong>{athlete.lastWeightEntry.weight} kg</strong> registrado el{' '}
                    {formatDate(athlete.lastWeightEntry.date)}
                  </p>
                </div>
              )}

              {athlete.lastTrainingSession && (
                <div>
                  <h4 className="font-semibold mb-2">Última Sesión de Entrenamiento</h4>
                  <p>
                    <strong>{athlete.lastTrainingSession.session_type}</strong> el{' '}
                    {formatDate(athlete.lastTrainingSession.date)}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Estadísticas</h4>
                <ul className="space-y-1 text-sm">
                  <li>• {athlete.weeklySessionsCount} sesiones esta semana</li>
                  <li>• {athlete.totalTechniques} técnicas registradas</li>
                  <li>• {athlete.totalTacticalNotes} notas tácticas</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peso">
          <Card>
            <CardHeader>
              <CardTitle>Evolución del Peso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidad de gráficos de peso en desarrollo...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entrenamientos">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Entrenamientos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Historial detallado de entrenamientos en desarrollo...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tecnicas">
          <Card>
            <CardHeader>
              <CardTitle>Técnicas Registradas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Biblioteca de técnicas del deportista en desarrollo...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tacticas">
          <Card>
            <CardHeader>
              <CardTitle>Notas Tácticas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Estrategias y notas tácticas en desarrollo...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="randori">
          <Card>
            <CardHeader>
              <CardTitle>Sesiones de Randori</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Análisis de combates de práctica en desarrollo...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
