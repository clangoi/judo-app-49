
import { AthleteData } from "@/hooks/useAthleteManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, Trophy, TrendingUp, Eye } from "lucide-react";

interface AthleteCardProps {
  athlete: AthleteData;
  onClick: () => void;
  isSelected?: boolean;
}

export const AthleteCard = ({ athlete, onClick, isSelected = false }: AthleteCardProps) => {
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

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md bg-card border-primary/20 ${
        isSelected ? 'ring-2 ring-primary shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">{athlete.full_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{athlete.email}</p>
            </div>
          </div>
          {!isSelected && (
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Estado y Cinturón */}
        <div className="flex gap-2">
          <Badge className={getActivityColor(athlete.activityStatus)}>
            {getActivityLabel(athlete.activityStatus)}
          </Badge>
          <Badge className={getBeltColor(athlete.current_belt)}>
            {athlete.current_belt}
          </Badge>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3 text-primary" />
              <span className="text-sm font-semibold text-primary">
                {athlete.weeklySessionsCount}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Sesiones</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1">
              <Trophy className="h-3 w-3 text-primary" />
              <span className="text-sm font-semibold text-primary">
                {athlete.totalTechniques}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Técnicas</div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-sm font-semibold text-primary">
                {athlete.totalTacticalNotes}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Tácticas</div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-xs text-muted-foreground">
          <p>Club: {athlete.club_name}</p>
          {athlete.lastWeightEntry && (
            <p>Último peso: {athlete.lastWeightEntry.weight} kg</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
