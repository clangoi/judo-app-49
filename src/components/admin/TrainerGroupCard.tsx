
import { TrainerWithAthletes } from "@/hooks/useAdminAthleteManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, TrendingUp, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { useState } from "react";
import { AthleteCard } from "@/components/gestion/AthleteCard";

interface TrainerGroupCardProps {
  trainer: TrainerWithAthletes;
  onAthleteSelect: (athleteId: string) => void;
}

export const TrainerGroupCard = ({ trainer, onAthleteSelect }: TrainerGroupCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getActivityColor = (count: number, total: number) => {
    const percentage = (count / total) * 100;
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {trainer.trainer_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{trainer.trainer_email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {isExpanded ? 'Ocultar' : 'Ver'} Deportistas
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estadísticas del entrenador */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{trainer.totalAthletes}</div>
            <div className="text-xs text-muted-foreground">Total Deportistas</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getActivityColor(trainer.activeAthletes, trainer.totalAthletes)}`}>
              {trainer.activeAthletes}
            </div>
            <div className="text-xs text-muted-foreground">Activos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{trainer.averageWeeklySessions}</div>
            <div className="text-xs text-muted-foreground">Sesiones/sem</div>
          </div>
        </div>

        {/* Lista de deportistas expandible */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Deportistas Asignados ({trainer.athletes.length})</h4>
              
              {trainer.athletes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Este entrenador no tiene deportistas asignados.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trainer.athletes.map((athlete) => (
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
        )}

        {/* Indicador de expansión cuando está colapsado */}
        {!isExpanded && trainer.athletes.length > 0 && (
          <div className="flex items-center justify-center text-muted-foreground">
            <ChevronDown className="h-4 w-4 mr-1" />
            <span className="text-sm">Haz clic para ver los {trainer.athletes.length} deportistas</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
