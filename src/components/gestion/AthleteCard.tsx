
import { AthleteData } from "@/hooks/useAthleteManagement";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Weight, Trophy, Target, Eye } from "lucide-react";

interface AthleteCardProps {
  athlete: AthleteData;
  onClick: () => void;
}

export const AthleteCard = ({ athlete, onClick }: AthleteCardProps) => {
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
      year: '2-digit'
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Evitar que el clic en el botón active el clic de la tarjeta
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick();
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{athlete.full_name}</h3>
            <p className="text-sm text-muted-foreground">{athlete.email}</p>
          </div>
          <Badge className={getActivityColor(athlete.activityStatus)}>
            {getActivityLabel(athlete.activityStatus)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información básica */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Cinturón:</span>
          </div>
          <Badge className={getBeltColor(athlete.current_belt)}>
            {athlete.current_belt}
          </Badge>
        </div>

        {/* Último peso */}
        {athlete.lastWeightEntry && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Último peso:</span>
            </div>
            <div className="text-sm font-medium">
              {athlete.lastWeightEntry.weight} kg
              <span className="text-muted-foreground ml-1">
                ({formatDate(athlete.lastWeightEntry.date)})
              </span>
            </div>
          </div>
        )}

        {/* Última sesión */}
        {athlete.lastTrainingSession && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Última sesión:</span>
            </div>
            <div className="text-sm font-medium">
              {formatDate(athlete.lastTrainingSession.date)}
            </div>
          </div>
        )}

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{athlete.weeklySessionsCount}</div>
            <div className="text-xs text-muted-foreground">Sesiones/sem</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{athlete.totalTechniques}</div>
            <div className="text-xs text-muted-foreground">Técnicas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{athlete.totalTacticalNotes}</div>
            <div className="text-xs text-muted-foreground">Tácticas</div>
          </div>
        </div>

        {/* Botón de ver detalles */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={handleButtonClick}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalles
        </Button>
      </CardContent>
    </Card>
  );
};
